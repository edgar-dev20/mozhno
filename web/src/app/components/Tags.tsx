import { useState, useMemo } from 'react';
import { Plus, Tag as TagIcon, Palette, Hash, Sparkles, Trash2 } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SidePanel } from "@/app/components/SidePanel";
import { TipCard } from "@/app/components/TipCard";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { api, Tag } from "@/api";
import { adjustColor, SectionHeader, EmptyState, ColorBar, FormField, GradientButton, ErrorBox } from "@/shared";
import { useProjectQuery, useTagsQuery } from '@/app/hooks/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useT, type MessageKey } from '@/i18n';

const COLOR_PALETTES: [MessageKey, string[]][] = [
  ['tags.colors.red', ['#ef4444','#dc2626','#f87171','#b91c1c']],
  ['tags.colors.orange', ['#f97316','#ea580c','#fb923c','#c2410c']],
  ['tags.colors.amber', ['#f59e0b','#d97706','#fbbf24','#b45309']],
  ['tags.colors.green', ['#84cc16','#65a30d','#22c55e','#16a34a','#10b981','#059669']],
  ['tags.colors.teal', ['#14b8a6','#0d9488','#06b6d4','#0891b2','#0e7490']],
  ['tags.colors.blue', ['#3b82f6','#2563eb','#1d4ed8','#60a5fa']],
  ['tags.colors.violet', ['#6366f1','#4f46e5','#8b5cf6','#7c3aed','#a855f7','#9333ea']],
  ['tags.colors.pink', ['#d946ef','#c026d3','#ec4899','#db2777','#be185d']],
];

const colorHexCache: Record<string, string> = {};
const getColorName = (hex: string): string => {
  if (colorHexCache[hex]) return colorHexCache[hex];
  const normalized = hex.toLowerCase();
  const names: Record<string, string> = {
    '#ef4444': 'Red 500', '#dc2626': 'Red 600', '#f87171': 'Red 400', '#b91c1c': 'Red 700',
    '#f97316': 'Orange 500', '#ea580c': 'Orange 600', '#fb923c': 'Orange 400', '#c2410c': 'Orange 700',
    '#f59e0b': 'Amber 500', '#d97706': 'Amber 600', '#fbbf24': 'Amber 400', '#b45309': 'Amber 700',
    '#84cc16': 'Lime 500', '#65a30d': 'Lime 600', '#22c55e': 'Green 500', '#16a34a': 'Green 600',
    '#10b981': 'Emerald 500', '#059669': 'Emerald 600', '#14b8a6': 'Teal 500', '#0d9488': 'Teal 600',
    '#06b6d4': 'Cyan 500', '#0891b2': 'Cyan 600', '#0e7490': 'Cyan 700',
    '#3b82f6': 'Blue 500', '#2563eb': 'Blue 600', '#1d4ed8': 'Blue 700', '#60a5fa': 'Blue 400',
    '#6366f1': 'Indigo 500', '#4f46e5': 'Indigo 600', '#8b5cf6': 'Violet 500', '#7c3aed': 'Violet 600',
    '#a855f7': 'Purple 500', '#9333ea': 'Purple 600', '#d946ef': 'Fuchsia 500', '#c026d3': 'Fuchsia 600',
    '#ec4899': 'Pink 500', '#db2777': 'Pink 600', '#be185d': 'Pink 700',
  };
  colorHexCache[hex] = names[normalized] ?? hex;
  return colorHexCache[hex];
};

export function Tags() {
  const t = useT();
  const queryClient = useQueryClient();

  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;
  const { data: tags = [], isLoading: loading } = useTagsQuery();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [initialTag, setInitialTag] = useState<{ name: string; desc: string; color: string } | null>(null);
  const [customHex, setCustomHex] = useState('');
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.tags.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setDeleteId(null);
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : t('tags.errors.delete'));
    },
    onSettled: () => setDeleting(false),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error('No project');
      if (editing) {
        return api.tags.update(editing.id, { name: formName, description: formDesc, color: formColor });
      } else {
        return api.tags.create({ name: formName, description: formDesc, color: formColor });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : t('tags.errors.save'));
    },
    onSettled: () => setSaving(false),
  });

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setFormColor('#3b82f6'); setCustomHex(''); setError(''); setInitialTag(null); setPanelOpen(true); };
  const openEdit = (tag: Tag) => { setEditing(tag); setFormName(tag.name); setFormDesc(tag.description ?? ''); setFormColor(tag.color); setCustomHex(''); setError(''); setInitialTag({ name: tag.name, desc: tag.description ?? '', color: tag.color }); setPanelOpen(true); };

  const applyCustomHex = () => {
    const hex = customHex.startsWith('#') ? customHex : `#${customHex}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setFormColor(hex.toLowerCase());
      setCustomHex('');
    }
  };

  const handleDelete = () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    deleteMutation.mutate(deleteId);
  };

  const isTagDirty = useMemo(() => {
    if (!editing || !initialTag) return false;
    return formName !== initialTag.name || formDesc !== initialTag.desc || formColor !== initialTag.color;
  }, [formName, formDesc, formColor, editing, initialTag]);

  const handleSave = () => {
    if (!projectId) return;
    setError('');
    setSaving(true);
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title={t('tags.title')}
          description={t('tags.description')}
        />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>{t('tags.create')}</GradientButton>
      </div>

      <TipCard
        text={t('tags.tipText')}
        label={t('tags.tipLabel')}
        icon={<TagIcon />}
        storageKey="tags"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-accent rounded w-2/3" />
                  <div className="h-3 bg-accent rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <EmptyState
          icon={<TagIcon size={28} className="text-blue-600 dark:text-blue-400" />}
          title={t('tags.emptyTitle')}
          description={t('tags.emptyDescription')}
          buttonLabel={t('tags.create')}
          onAction={openCreate}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag, idx) => (
              <motion.div
                key={tag.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => openEdit(tag)}
              >
                <ColorBar color={tag.color} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${tag.color}, ${adjustColor(tag.color, 25)})`,
                          boxShadow: `0 4px 12px ${tag.color}33`,
                        }}
                      >
                        <TagIcon size={18} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{tag.name}</h3>
                        <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">{getColorName(tag.color)}</p>
                      </div>
                    </div>
                  </div>
                  {tag.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {tag.description}
                    </p>
                  )}
                  {!tag.description && (
                    <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
                      {t('tags.card.noDescription')}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-neutral-900" style={{ backgroundColor: adjustColor(tag.color, i * 15 - 15), opacity: 0.6 - i * 0.15 }} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground/70 font-medium">{getColorName(tag.color)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editing ? t('tags.panel.editTitle') : t('tags.panel.createTitle')}
        description={editing
          ? t('tags.panel.editDescription')
          : t('tags.panel.createDescription')
        }
        footer={<>
          <button onClick={() => setPanelOpen(false)} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors">{t('tags.panel.cancel')}</button>
          <GradientButton onClick={handleSave} disabled={saving || !formName.trim() || (editing && !isTagDirty)} loading={saving}>{editing ? t('common.saveChanges') : t('tags.panel.saveCreate')}</GradientButton>
        </>}
      >
        <div className="space-y-6">
          {error && (
            <ErrorBox>{error}</ErrorBox>
          )}

          <FormField label={t('tags.form.name.label')} hint={t('tags.form.name.hint')} maxLength={120} value={formName}>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              maxLength={120}
              placeholder={t('tags.form.name.placeholder')}
              autoFocus={!editing}
              className="w-full bg-white dark:bg-neutral-950 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
            />
          </FormField>

          <FormField label={t('tags.form.description.label')} hint={t('tags.form.description.hint')} maxLength={160} value={formDesc}>
            <textarea
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              maxLength={160}
              placeholder={t('tags.form.description.placeholder')}
              rows={3}
              className="w-full bg-white dark:bg-neutral-950 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none"
            />
          </FormField>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
              <Palette size={14} className="text-violet-500" />{t('tags.form.color.label')}
            </label>

            <div className="p-4 bg-secondary rounded-2xl border border-border space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl shadow-lg shrink-0 flex items-center justify-center transition-all"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${formColor}, ${adjustColor(formColor, 25)})`,
                    boxShadow: `0 8px 24px ${formColor}40`,
                  }}
                >
                  <TagIcon size={20} className="text-white" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">{t('tags.form.color.preview')}</div>
                  {formName.trim() ? (
                    <div className="font-semibold text-foreground truncate">{formName}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic truncate">{t('tags.form.color.noName')}</div>
                  )}
                  <div className="text-xs text-muted-foreground/70 font-mono flex items-center gap-1">
                    <Hash size={10} />{formColor}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">#</span>
                  <input
                    type="text"
                    value={customHex}
                    onChange={e => setCustomHex(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') applyCustomHex(); }}
                    placeholder={t('tags.form.color.hexPlaceholder')}
                    maxLength={7}
                    className="w-full bg-card border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <GradientButton
                  onClick={applyCustomHex}
                  disabled={!customHex}
                  size="sm"
                  className="shrink-0"
                >
                  {t('tags.form.color.apply')}
                </GradientButton>
              </div>
            </div>

            <div className="space-y-3">
              {COLOR_PALETTES.map(([key, colors]) => (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{t(key)}</span>
                    <div className="h-px flex-1 bg-accent" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {colors.map(c => {
                      const active = formColor === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormColor(c)}
                          title={getColorName(c)}
                          className="w-9 h-9 rounded-lg transition-all relative group"
                          style={{
                            backgroundColor: c,
                            transform: active ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: active ? `0 0 0 3px ${c}55, 0 4px 12px ${c}40` : '0 1px 3px #00000015',
                            zIndex: active ? 5 : 1,
                          }}
                        >
                          {active && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                            </span>
                          )}
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {getColorName(c)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              {t('tags.form.color.hint')}
            </p>
          </div>

          {editing && (
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteId(editing.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20 transition-all"
              >
                <Trash2 size={16} />
                {t('tags.delete.button')}
              </button>
            </div>
          )}
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title={t('tags.delete.confirmTitle')}
        description={t('tags.delete.confirmDescription', { name: tags.find(tag => tag.id === deleteId)?.name ?? '' })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
