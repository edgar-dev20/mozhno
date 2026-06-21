import { useState, useMemo } from 'react';
import { Plus, Tag as TagIcon, Palette, Hash, Sparkles, Trash2 } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SidePanel } from '@/app/components/SidePanel';
import { TipCard } from '@/app/components/TipCard';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { TagCardSkeletonList } from '@/app/components/skeletons';
import { api, Tag } from '@/api';
import {
  adjustColor,
  SectionHeader,
  EmptyState,
  ColorBar,
  ColorIcon,
  FormField,
  GradientButton,
  ErrorBox,
  getErrorMessage,
} from '@/shared';
import { useProjectQuery, useTagsQuery } from '@/app/hooks/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useT, type MessageKey } from '@/i18n';

const COLOR_PALETTES: [MessageKey, string[]][] = [
  ['tags.colors.red', ['#b85a50', '#c87068', '#d8847c', '#a04840']],
  ['tags.colors.orange', ['#b86840', '#c87850', '#e09060', '#9a4828']],
  ['tags.colors.amber', ['#b89430', '#d0a840', '#e8c050', '#987820']],
  ['tags.colors.green', ['#4a8c5e', '#5a9e6e', '#6db87e', '#3a7048', '#2d8860', '#1d7850']],
  ['tags.colors.teal', ['#1a6b60', '#2d9484', '#3db8a5', '#155a50', '#0e7a6e']],
  ['tags.colors.blue', ['#4a6e8a', '#5a82a0', '#6e94b4', '#3a5870']],
  ['tags.colors.violet', ['#2d3a32', '#4a5e50', '#5a7260', '#6b8676', '#3a4a40', '#507060']],
  ['tags.colors.pink', ['#b87070', '#c88484', '#d89898', '#a05858', '#9a4860']],
];

const colorHexCache: Record<string, string> = {};
const getColorName = (hex: string): string => {
  if (colorHexCache[hex]) return colorHexCache[hex];
  const normalized = hex.toLowerCase();
  const names: Record<string, string> = {
    '#b85a50': 'Red 500', '#c87068': 'Red 400', '#d8847c': 'Red 300', '#a04840': 'Red 600',
    '#b86840': 'Terracotta 500', '#c87850': 'Terracotta 400', '#e09060': 'Terracotta 300', '#9a4828': 'Terracotta 600',
    '#b89430': 'Gold 500', '#d0a840': 'Gold 400', '#e8c050': 'Gold 300', '#987820': 'Gold 600',
    '#4a8c5e': 'Forest 500', '#5a9e6e': 'Forest 400', '#6db87e': 'Forest 300', '#3a7048': 'Forest 600', '#2d8860': 'Pine 500', '#1d7850': 'Pine 600',
    '#1a6b60': 'Teal 700', '#2d9484': 'Teal 500', '#3db8a5': 'Teal 400', '#155a50': 'Teal 800', '#0e7a6e': 'Teal 900',
    '#4a6e8a': 'Slate 500', '#5a82a0': 'Slate 400', '#6e94b4': 'Slate 300', '#3a5870': 'Slate 600',
    '#2d3a32': 'Moss 800', '#4a5e50': 'Moss 600', '#5a7260': 'Moss 500', '#6b8676': 'Moss 400', '#3a4a40': 'Moss 700', '#507060': 'Moss 550',
    '#b87070': 'Rose 500', '#c88484': 'Rose 400', '#d89898': 'Rose 300', '#a05858': 'Rose 600', '#9a4860': 'Rose 700',
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
  const [formColor, setFormColor] = useState('#1a6b60');
  const [initialTag, setInitialTag] = useState<{
    name: string;
    desc: string;
    color: string;
  } | null>(null);
  const [customHex, setCustomHex] = useState('');
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.tags.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      setDeleteId(null);
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e));
    },
    onSettled: () => setDeleting(false),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error('No project');
      if (editing) {
        return api.tags.update(editing.id, {
          name: formName,
          description: formDesc,
          color: formColor,
        });
      } else {
        return api.tags.create({ name: formName, description: formDesc, color: formColor });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : t('tags.errors.save'));
    },
    onSettled: () => setSaving(false),
  });

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormDesc('');
    setFormColor('#1a6b60');
    setCustomHex('');
    setError('');
    setInitialTag(null);
    setPanelOpen(true);
  };
  const openEdit = (tag: Tag) => {
    setEditing(tag);
    setFormName(tag.name);
    setFormDesc(tag.description ?? '');
    setFormColor(tag.color);
    setCustomHex('');
    setError('');
    setInitialTag({ name: tag.name, desc: tag.description ?? '', color: tag.color });
    setPanelOpen(true);
  };

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
    return (
      formName !== initialTag.name || formDesc !== initialTag.desc || formColor !== initialTag.color
    );
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
        <SectionHeader title={t('tags.title')} description={t('tags.description')} />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>
          {t('tags.create')}
        </GradientButton>
      </div>

      <TipCard
        text={t('tags.tipText')}
        label={t('tags.tipLabel')}
        icon={<TagIcon />}
        storageKey="tags"
      />

      {loading ? (
        <TagCardSkeletonList count={6} />
      ) : tags.length === 0 ? (
        <EmptyState
          icon={<TagIcon size={28} className="text-info" />}
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
                className="group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                onClick={() => openEdit(tag)}
                role="button"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openEdit(tag);
                  }
                }}
              >
                <ColorBar color={tag.color} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ColorIcon
                        size="lg"
                        color={tag.color}
                        icon={<TagIcon size={18} className="text-white" />}
                        shadow
                        className="group-hover:scale-110 transition-transform"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{tag.name}</h3>
                        <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">
                          {getColorName(tag.color)}
                        </p>
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
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border-2 border-white dark:border-neutral-900"
                          style={{
                            backgroundColor: adjustColor(tag.color, i * 15 - 15),
                            opacity: 0.6 - i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground/70 font-medium">
                      {getColorName(tag.color)}
                    </span>
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
        description={editing ? t('tags.panel.editDescription') : t('tags.panel.createDescription')}
        footer={
          <>
            <button
              onClick={() => setPanelOpen(false)}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors"
            >
              {t('tags.panel.cancel')}
            </button>
            <GradientButton
              onClick={handleSave}
              disabled={saving || !formName.trim() || (editing && !isTagDirty)}
              loading={saving}
            >
              {editing ? t('common.saveChanges') : t('tags.panel.saveCreate')}
            </GradientButton>
          </>
        }
      >
        <div className="space-y-6">
          {error && <ErrorBox>{error}</ErrorBox>}

          <FormField
            label={t('tags.form.name.label')}
            hint={t('tags.form.name.hint')}
            maxLength={120}
            value={formName}
          >
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              maxLength={120}
              placeholder={t('tags.form.name.placeholder')}
              autoFocus={!editing}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
            />
          </FormField>

          <FormField
            label={t('tags.form.description.label')}
            hint={t('tags.form.description.hint')}
            maxLength={160}
            value={formDesc}
          >
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              maxLength={160}
              placeholder={t('tags.form.description.placeholder')}
              rows={3}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none"
            />
          </FormField>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
              <Palette size={14} className="text-brand" />
              {t('tags.form.color.label')}
            </label>

            <div className="p-4 bg-secondary rounded-2xl border border-border space-y-4">
              <div className="flex items-center gap-3">
                <ColorIcon
                  variant="gradient"
                  size="xl"
                  color={formColor}
                  icon={<TagIcon size={20} className="text-white" />}
                  shadow
                  darkDim={false}
                  className="transition-all"
                />
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                    {t('tags.form.color.preview')}
                  </div>
                  {formName.trim() ? (
                    <div className="font-semibold text-foreground truncate">{formName}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic truncate">
                      {t('tags.form.color.noName')}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground/70 font-mono flex items-center gap-1">
                    <Hash size={10} />
                    {formColor}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                    #
                  </span>
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') applyCustomHex();
                    }}
                    placeholder={t('tags.form.color.hexPlaceholder')}
                    maxLength={7}
                    className="w-full bg-card border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-normal text-muted-foreground/50 tabular-nums">
                    {customHex.length}/7
                  </span>
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
                    <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {t(key)}
                    </span>
                    <div className="h-px flex-1 bg-accent" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {colors.map((c) => {
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
                            boxShadow: active
                              ? `0 0 0 3px ${c}55, 0 4px 12px ${c}40`
                              : '0 1px 3px #00000015',
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
              <Sparkles size={12} className="text-warning" />
              {t('tags.form.color.hint')}
            </p>
          </div>

          {editing && (
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteId(editing.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg border border-destructive/20 transition-all"
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
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('tags.delete.confirmTitle')}
        description={t('tags.delete.confirmDescription', {
          name: tags.find((tag) => tag.id === deleteId)?.name ?? '',
        })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
