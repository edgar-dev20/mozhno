import { useState, useMemo } from 'react';
import { Plus, Users, Filter, Settings, X, PieChart, Upload, ChevronDown, Trash2 } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { TipCard } from "@/app/components/TipCard";
import { SidePanel } from "@/app/components/SidePanel";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { DiffConfirmDialog } from "@/app/components/DiffConfirmDialog";
import { computeDiff, DiffChange } from "@/shared/diffUtils";
import { SegmentIcon, SegmentIconPicker, SegmentColorPicker } from "@/app/components/SegmentIcon";
import { SegmentResponse } from "@/api";
import { getOperatorsForType, getDefaultOperator, isValidOperator, OPERATOR_LABELS } from "@/app/components/operators";
import { SectionHeader, EmptyState, ColorBar, FormField, GradientButton, LoadingState } from "@/shared";
import { useT } from '@/i18n';

import { useSegments } from "@/app/hooks/useSegments";

interface SegmentContextEntry {
  id: string;
  contextDefinitionId: number;
  operator: string;
  contextValues: string;
}

export function Segments() {
  const t = useT();
  const {
    segments, contexts, loading, error,
    setError, handleDelete, handleSave,
  } = useSegments();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<SegmentResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Users');
  const [formColor, setFormColor] = useState('#7c3aed');
  const [formContexts, setFormContexts] = useState<SegmentContextEntry[]>([]);
  const [initialSegment, setInitialSegment] = useState<{ name: string; desc: string; icon: string; color: string; contexts: SegmentContextEntry[] } | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffChanges, setDiffChanges] = useState<DiffChange[]>([]);

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setFormIcon('Users'); setFormColor('#7c3aed'); setFormContexts([]); setError(''); setShowCustomize(false); setInitialSegment(null); setPanelOpen(true); };
  const openEdit = (s: SegmentResponse) => {
    setEditing(s); setFormName(s.name); setFormDesc(s.description ?? ''); setFormIcon(s.icon ?? 'Users'); setFormColor(s.color ?? '#7c3aed');
    const initContexts = (s.context ?? []).map((c, i) => {
      const ctx = contexts.find(cd => cd.id === c.contextDefinitionId);
      const op = c.operator ?? 'in';
      return {
        id: `sc-${Date.now()}-${i}`,
        contextDefinitionId: c.contextDefinitionId,
        operator: isValidOperator(ctx?.type, op) ? op : getDefaultOperator(ctx?.type),
        contextValues: c.contextValues,
      };
    });
    setFormContexts(initContexts);
    setInitialSegment({ name: s.name, desc: s.description ?? '', icon: s.icon ?? 'Users', color: s.color ?? '#7c3aed', contexts: JSON.parse(JSON.stringify(initContexts)) });
    setError(''); setShowCustomize(false); setPanelOpen(true);
  };

  const doDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await handleDelete(deleteId); setDeleteId(null); setPanelOpen(false); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : t('segments.errors.delete')); } finally { setDeleting(false); }
  };

  const addContext = () => {
    const defaultCtx = contexts[0];
    const operator = getDefaultOperator(defaultCtx?.type);
    setFormContexts(prev => [...prev, { id: `sc-${Date.now()}`, contextDefinitionId: defaultCtx?.id ?? 0, operator, contextValues: '' }]);
  };
  const removeContext = (id: string) => setFormContexts(prev => prev.filter(c => c.id !== id));
  const updateContextDef = (id: string, contextDefinitionId: number) => setFormContexts(prev => prev.map(c => {
    if (c.id !== id) return c;
    const ctx = contexts.find(x => x.id === contextDefinitionId);
    return { ...c, contextDefinitionId, operator: getDefaultOperator(ctx?.type) };
  }));
  const updateOperator = (id: string, operator: string) => setFormContexts(prev => prev.map(c => c.id === id ? { ...c, operator } : c));

  const addValue = (id: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormContexts(prev => prev.map(c => {
      if (c.id !== id) return c;
      const existing = c.contextValues ? c.contextValues.split(',').map(v => v.trim()).filter(Boolean) : [];
      if (existing.includes(trimmed)) return c;
      return { ...c, contextValues: existing.concat(trimmed).join(', ') };
    }));
  };

  const removeValue = (id: string, index: number) => {
    setFormContexts(prev => prev.map(c => {
      if (c.id !== id) return c;
      const values = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
      values.splice(index, 1);
      return { ...c, contextValues: values.join(', ') };
    }));
  };

  const handleFileUpload = (id: string, file: File) => {
    const MAX_SIZE = 1_048_576;
    if (file.size > MAX_SIZE) { setError(t('segments.errors.fileTooBig', { size: String((MAX_SIZE / 1024 / 1024).toFixed(1)) })); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const newValues = text.split(/[\n\r,]+/).map(v => v.trim()).filter(Boolean);
      setFormContexts(prev => prev.map(c => {
        if (c.id !== id) return c;
        const existing = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
        const merged = [...new Set([...existing, ...newValues])];
        return { ...c, contextValues: merged.join(', ') };
      }));
    };
    reader.readAsText(file);
  };

  const isSegmentDirty = useMemo(() => {
    if (!editing || !initialSegment) return false;
    return formName !== initialSegment.name
      || formDesc !== initialSegment.desc
      || formIcon !== initialSegment.icon
      || formColor !== initialSegment.color
      || JSON.stringify(formContexts.map(({ id, ...rest }) => rest)) !== JSON.stringify(initialSegment.contexts.map(({ id, ...rest }) => rest));
  }, [formName, formDesc, formIcon, formColor, formContexts, editing, initialSegment]);

  const doSave = async () => {
    setError(''); setSaving(true);
    try {
      if (editing) {
        const fmtContexts = (rules: { contextDefinitionId: number; operator: string; contextValues: string }[]) =>
          rules.map(c => {
            const ctx = contexts.find(cd => cd.id === c.contextDefinitionId);
            const name = ctx?.name ?? t('segments.unknownField', { id: String(c.contextDefinitionId) });
            const op = OPERATOR_LABELS[c.operator] ?? c.operator;
            return `${name} в ${op} в ${c.contextValues}`;
          }).join('; ') || '-';

        const before: Record<string, unknown> = {
          name: editing.name,
          description: editing.description ?? '',
          icon: editing.icon ?? 'Users',
          color: editing.color ?? '#7c3aed',
          context: fmtContexts(editing.context ?? []),
        };
        const contextAfter = formContexts.map(c => ({ contextDefinitionId: c.contextDefinitionId, operator: c.operator, contextValues: c.contextValues }));
        const after: Record<string, unknown> = {
          name: formName,
          description: formDesc,
          icon: formIcon,
          color: formColor,
          context: fmtContexts(contextAfter),
        };
        const changes = computeDiff(before, after, {
          name: t('segments.diffFields.name'),
          description: t('segments.diffFields.description'),
          icon: t('segments.diffFields.icon'),
          color: t('segments.diffFields.color'),
          context: t('segments.diffFields.context'),
        });
        if (changes.length > 0) {
          setDiffChanges(changes);
          setDiffOpen(true);
          setSaving(false);
          return;
        }
      }
      const context = formContexts.map(c => ({ contextDefinitionId: c.contextDefinitionId, operator: c.operator, contextValues: c.contextValues }));
      await handleSave(editing, { name: formName, description: formDesc, icon: formIcon, color: formColor, context });
      setPanelOpen(false);
          } catch (e: unknown) { setError(e instanceof Error ? e.message : t('segments.errors.save')); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader
          title={t('segments.title')}
          description={t('segments.description')}
        />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>{t('segments.create')}</GradientButton>
      </div>

      <TipCard
        text={t('segments.tipText')}
        label={t('segments.tipLabel')}
        icon={<PieChart />}
        storageKey="segments"
      />

      {loading ? (
        <LoadingState text={t('segments.loading')} />
      ) : segments.length === 0 ? (
        <EmptyState
          icon={<SegmentIcon name="Users" size={28} className="text-teal-500 dark:text-teal-400" />}
          title={t('segments.emptyTitle')}
          description={t('segments.emptyDescription')}
          buttonLabel={t('segments.emptyButton')}
          onAction={openCreate}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((s, idx) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:border-border hover:shadow-md transition-all relative group"
            >
              <ColorBar color={s.color || '#7c3aed'} />
              <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div
                  className="p-2.5 rounded-xl text-white cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: s.color || '#7c3aed' }}
                  onClick={() => openEdit(s)}
                >
                  <SegmentIcon name={s.icon || 'Users'} size={24} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1.5 cursor-pointer hover:text-foreground/60 dark:hover:text-muted-foreground/60 transition-colors" onClick={() => openEdit(s)}>{s.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2 h-10">{s.description}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><Users size={16} className="text-muted-foreground/70" /><span className="text-foreground/60 dark:text-muted-foreground/60">{t('segments.contextCount', { count: String((s.context ?? []).length) })}</span></div>
                {s.context && s.context.length > 0 && (
                  <div className="bg-secondary rounded-lg p-3 border border-border flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider"><Filter size={12} />{t('segments.rules')}</div>
                    <div className="space-y-1">
                      {s.context.map((c, ci) => {
                        const ctxDef = contexts.find(cd => cd.id === c.contextDefinitionId);
                        return (
                          <div key={ci} className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-muted-foreground">{ctxDef?.name ?? t('segments.unknownField', { id: String(c.contextDefinitionId) })}</span>
                            <span className="text-muted-foreground/70 font-mono text-xs uppercase">{c.operator ?? 'in'}</span>
                            <code className="font-mono text-emerald-600 dark:text-emerald-400 break-all line-clamp-1">{c.contextValues}</code>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              </div>
            </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <SidePanel open={panelOpen} onOpenChange={setPanelOpen} title={editing ? t('segments.panel.editTitle') : t('segments.panel.createTitle')} description={t('segments.panel.description')} footer={<>
        <button onClick={() => setPanelOpen(false)} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-xl transition-colors">{t('segments.panel.cancel')}</button>
        <GradientButton onClick={doSave} disabled={saving || !formName || (editing && !isSegmentDirty)} loading={saving}>{editing ? t('common.saveChanges') : t('segments.panel.create')}</GradientButton>
      </>}>
        <div className="space-y-5">
          {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700">{error}</div>}

          <FormField label={t('common.name')} maxLength={120} value={formName}>
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} maxLength={120} placeholder={t('segments.form.namePlaceholder')} className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground" />
          </FormField>
          <FormField label={t('common.description')} maxLength={160} value={formDesc}>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} maxLength={160} placeholder={t('segments.form.descriptionPlaceholder')} rows={2} ref={el => { if (el) { el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 64) + 'px'; } }} onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 64) + 'px'; }} className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none overflow-hidden" />
          </FormField>

          <div className="pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary dark:hover:bg-neutral-900 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: formColor }}
                >
                  <SegmentIcon name={formIcon} size={15} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground/80">{t('segments.customize.title')}</div>
                  <div className="text-xs text-muted-foreground/70">{t('segments.customize.subtitle')}</div>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted-foreground group-hover:text-foreground/60 dark:group-hover:text-muted-foreground/60 transition-transform duration-200 ${showCustomize ? 'rotate-180' : ''}`}
              />
            </button>

            {showCustomize && (
              <div className="mt-3 space-y-4 pl-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('common.icon')}</label>
                  <SegmentIconPicker value={formIcon} onChange={setFormIcon} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('common.color')}</label>
                  <SegmentColorPicker value={formColor} onChange={setFormColor} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-indigo-600 dark:text-indigo-400" />
                <label className="text-sm font-medium text-foreground/80">{t('segments.targetingRules.title')}</label>
                <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium">{t('segments.targetingRules.badge')}</span>
              </div>
              <button onClick={addContext} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-medium"><Plus size={12} />{t('segments.targetingRules.add')}</button>
            </div>
            <div className="space-y-3">
              {formContexts.map((c, ci) => {
                const parsedValues = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
                return (
                  <div key={c.id} className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{t('segments.targetingRules.condition', { n: String(ci + 1) })}</span>
                      <button onClick={() => removeContext(c.id)} className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">{t('segments.targetingRules.attribute')}</label>
                        <Select value={String(c.contextDefinitionId)} onValueChange={(v) => updateContextDef(c.id, Number(v))}>
                            <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {contexts.map(ctx => <SelectItem key={ctx.id} value={String(ctx.id)}>{ctx.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>
                        <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">{t('segments.targetingRules.operator')}</label>
                        <Select value={c.operator} onValueChange={(v) => updateOperator(c.id, v)}>
                          <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {getOperatorsForType(contexts.find(ctx => ctx.id === c.contextDefinitionId)?.type).map(op => (
                              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide flex items-center gap-1.5">{t('segments.targetingRules.values')}
                        <label className="cursor-pointer text-indigo-500 hover:text-indigo-400 transition-colors" title={t('segments.targetingRules.uploadTooltip')}>
                          <Upload size={11} />
                          <input type="file" accept=".txt,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(c.id, f); e.target.value = ''; }} />
                        </label>
                      </label>
                      <input
                        type="text"
                        placeholder={t('segments.targetingRules.valuePlaceholder')}
                        className="w-full bg-secondary border border-border rounded-md px-2.5 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addValue(c.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                    {parsedValues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {parsedValues.map((v, vi) => (
                          <span key={vi} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 rounded-md break-all leading-none">
                            {v}
                            <button onClick={() => removeValue(c.id, vi)} className="text-emerald-500 hover:text-red-500 transition-colors"><X size={11} /></button>
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground self-center ml-1">{t('segments.targetingRules.valueCount', { count: String(parsedValues.length) })}</span>
                      </div>
                    )}
                    {parsedValues.length === 0 && (
                      <div className="text-xs text-muted-foreground italic">{t('segments.targetingRules.noValues')}</div>
                    )}
                  </div>
                );
              })}
              {formContexts.length === 0 && (
                <div className="p-4 bg-white dark:bg-neutral-950 rounded-lg border border-dashed border-border dark:border-neutral-700 text-center">
                  <p className="text-xs text-muted-foreground">{t('segments.targetingRules.emptyRules')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5"><div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center"><Settings size={12} className="text-white" /></div></div>
              <div>
                <h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">{t('segments.infoBox.title')}</h5>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">{t('segments.infoBox.description')}</p>
              </div>
            </div>
          </div>

          {editing && (
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteId(editing.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 transition-all"
              >
                <Trash2 size={16} />
                {t('segments.deleteButton')}
              </button>
            </div>
          )}
        </div>
      </SidePanel>

      <DiffConfirmDialog
        open={diffOpen}
        onClose={() => setDiffOpen(false)}
        changes={diffChanges}
        description={t('common.reviewChanges')}
        confirmLabel={t('common.applyChanges')}
        onConfirm={async () => {
          setDiffOpen(false);
          setSaving(true);
          try {
            const context = formContexts.map(c => ({ contextDefinitionId: c.contextDefinitionId, operator: c.operator, contextValues: c.contextValues }));
            await handleSave(editing, { name: formName, description: formDesc, icon: formIcon, color: formColor, context });
            setPanelOpen(false);
          } catch (e: unknown) { setError(e instanceof Error ? e.message : t('segments.errors.save')); } finally { setSaving(false); }
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title={t('segments.deleteConfirm.title')}
        description={t('segments.deleteConfirm.description', { name: segments.find(s => s.id === deleteId)?.name ?? '' })}
        confirmLabel={t('common.delete')}
        onConfirm={doDelete}
        loading={deleting}
      />
    </div>
  );
}
