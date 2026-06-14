import { useState, useMemo } from 'react';
import { Plus, Users, Filter, Settings, X, PieChart, Upload, ChevronDown, Trash2 } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { TipCard } from "@/app/components/TipCard";
import { SidePanel } from "@/app/components/SidePanel";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { InlineDiffBar } from "@/app/components/InlineDiffBar";
import { computeDiff, DiffChange } from "@/shared/diffUtils";
import { SegmentIcon, SegmentIconPicker, SegmentColorPicker } from "@/app/components/SegmentIcon";
import { SegmentResponse } from "@/api";
import { getDefaultOperator, isValidOperator, getInputPlaceholder, getInputPattern, getInputHint, getInputMode, isConstraintValueValid } from "@/app/components/operators";
import { OperatorBadge } from "@/app/components/OperatorBadge";
import { ConstraintRow } from "@/app/components/ConstraintRow";
import { SectionHeader, EmptyState, ColorBar, FormField, GradientButton, LoadingState, ErrorBox } from "@/shared";
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
  const [activeConditionId, setActiveConditionId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [diffChanges, setDiffChanges] = useState<DiffChange[]>([]);

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setFormIcon('Users'); setFormColor('#7c3aed'); setFormContexts([]); setError(''); setShowCustomize(false); setActiveConditionId(null); setInitialSegment(null); setPanelOpen(true); };
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
    setError(''); setShowCustomize(false); setActiveConditionId(null); setPanelOpen(true);
  };

  const addContext = () => {
    setFormContexts(prev => [...prev, { id: `sc-${Date.now()}`, contextDefinitionId: 0, operator: 'in', contextValues: '' }]);
  };

  const doDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await handleDelete(deleteId); setDeleteId(null); setPanelOpen(false); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : t('segments.errors.delete')); } finally { setDeleting(false); }
  };

  const removeContext = (id: string) => setFormContexts(prev => prev.filter(c => c.id !== id));

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
      || JSON.stringify(formContexts.map(({ id: _id, ...rest }) => rest)) !== JSON.stringify(initialSegment.contexts.map(({ id: _id2, ...rest }) => rest));
  }, [formName, formDesc, formIcon, formColor, formContexts, editing, initialSegment]);

  const hasInvalidConstraints = useMemo(() => {
    return formContexts.some(c => {
      if (c.contextDefinitionId === 0) return false;
      const ctx = contexts.find(cd => cd.id === c.contextDefinitionId);
      const type = ctx?.type ?? 'string';
      const isMulti = c.operator === 'in' || c.operator === 'not_in';
      if (isMulti || type === 'string') return false;
      const vals = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
      if (vals.length === 0) return false;
      return vals.some(v => !isConstraintValueValid(type, v, c.operator));
    });
  }, [formContexts, contexts]);

  const doSave = async () => {
    setError(''); setSaving(true);
    try {
      if (editing) {
        const renderCtxLines = (rules: { contextDefinitionId: number; operator: string; contextValues: string }[]) => {
          if (rules.length === 0) return <span className="text-muted-foreground/50 italic">—</span>;
          return (
            <div className="space-y-1">
              {rules.map((r, i) => {
                const ctx = contexts.find(cd => cd.id === r.contextDefinitionId);
                return (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-foreground/80">{ctx?.name ?? t('segments.unknownField', { id: String(r.contextDefinitionId) })}</span>
                    <OperatorBadge operator={r.operator ?? 'in'} />
                    <code className="font-mono text-emerald-600 dark:text-emerald-400 break-all">{r.contextValues || '—'}</code>
                  </div>
                );
              })}
            </div>
          );
        };

        const beforeSimple: Record<string, unknown> = {
          name: editing.name,
          description: editing.description ?? '',
          icon: editing.icon ?? 'Users',
          color: editing.color ?? '#7c3aed',
        };
        const afterSimple: Record<string, unknown> = {
          name: formName,
          description: formDesc,
          icon: formIcon,
          color: formColor,
        };
        const changes = computeDiff(beforeSimple, afterSimple, {
          name: t('segments.diffFields.name'),
          description: t('segments.diffFields.description'),
          icon: t('segments.diffFields.icon'),
          color: t('segments.diffFields.color'),
        });

        const contextAfter = formContexts.map(c => ({ contextDefinitionId: c.contextDefinitionId, operator: c.operator, contextValues: c.contextValues }));
        const beforeCtxStr = (editing.context ?? []).map(c => `${c.contextDefinitionId}:${c.operator}:${c.contextValues}`).join('|');
        const afterCtxStr = contextAfter.map(c => `${c.contextDefinitionId}:${c.operator}:${c.contextValues}`).join('|');

        if (beforeCtxStr !== afterCtxStr) {
          changes.push({
            field: 'context',
            label: t('segments.diffFields.context'),
            before: renderCtxLines(editing.context ?? []),
            after: renderCtxLines(contextAfter),
          });
        }

        if (changes.length > 0) {
          setDiffChanges(changes);
          setSaving(false);
          return;
        }
      }
      const context = formContexts.map(c => ({ contextDefinitionId: c.contextDefinitionId, operator: c.operator, contextValues: c.contextValues }));
      await handleSave(editing, { name: formName, description: formDesc, icon: formIcon, color: formColor, context });
      setPanelOpen(false);
          } catch (e: unknown) { setError(e instanceof Error ? e.message : t('segments.errors.save')); } finally { setSaving(false); }
  };

  const confirmApplyDiff = async () => {
    setDiffChanges([]);
    setSaving(true);
    try {
      const context = formContexts.map(c => ({ contextDefinitionId: c.contextDefinitionId, operator: c.operator, contextValues: c.contextValues }));
      await handleSave(editing, { name: formName, description: formDesc, icon: formIcon, color: formColor, context });
      setPanelOpen(false);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : t('segments.errors.save')); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 relative group"
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
                            <OperatorBadge operator={c.operator ?? 'in'} />
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

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editing ? t('segments.panel.editTitle') : t('segments.panel.createTitle')}
        description={t('segments.panel.description')}
        diffSlot={diffChanges.length > 0 ? <InlineDiffBar changes={diffChanges} /> : undefined}
        onDiffDismiss={diffChanges.length > 0 ? () => setDiffChanges([]) : undefined}
        footer={diffChanges.length > 0 ? (
          <>
            <button onClick={() => setDiffChanges([])} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors">{t('segments.panel.cancel')}</button>
            <GradientButton onClick={confirmApplyDiff} disabled={hasInvalidConstraints} loading={saving}>{t('common.applyChanges')}</GradientButton>
          </>
        ) : (
          <>
            <button onClick={() => setPanelOpen(false)} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors">{t('segments.panel.cancel')}</button>
            <GradientButton onClick={doSave} disabled={saving || !formName || (editing != null && !isSegmentDirty) || hasInvalidConstraints} loading={saving}>{editing ? t('common.saveChanges') : t('segments.panel.create')}</GradientButton>
          </>
        )}
      >
        <div className="space-y-5">
          {error && <ErrorBox>{error}</ErrorBox>}

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
            <div className="space-y-1.5">
              {formContexts.map((c) => {
                const isActive = activeConditionId === c.id;
                const parsedValues = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
                const formatRowValues = (vals: string[]): string => {
                  if (vals.length === 0) return '∅';
                  if (vals.length === 1) return vals[0];
                  const display = vals.slice(0, 3).join(', ');
                  return vals.length > 3 ? `[${display}, ...]` : `[${display}]`;
                };

                const updateEntry = (upd: Partial<SegmentContextEntry>) => {
                  setFormContexts(prev => prev.map(e => e.id === c.id ? { ...e, ...upd } : e));
                };

                const handleToggle = () => setActiveConditionId(isActive ? null : c.id);

                const handleRemove = () => {
                  removeContext(c.id);
                  setActiveConditionId(null);
                };

                const handleContextChange = (ctxId: number) => {
                  const ctx = contexts.find(cd => cd.id === ctxId);
                  updateEntry({ contextDefinitionId: ctxId, operator: getDefaultOperator(ctx?.type) });
                };

                const handleOperatorChange = (op: string) => {
                  updateEntry({ operator: op });
                };

                return (
                  <ConstraintRow
                    key={c.id}
                    id={c.id}
                    contextDefId={c.contextDefinitionId}
                    operator={c.operator}
                    valuesPreview={formatRowValues(parsedValues)}
                    contexts={contexts}
                    isActive={isActive}
                    onToggle={handleToggle}
                    onContextChange={handleContextChange}
                    onOperatorChange={handleOperatorChange}
                    onRemove={handleRemove}
                  >
                    {(contextType) => (
                    <div className="space-y-3">
                      <div className="flex items-start gap-1.5">
                        <div className="flex-1 space-y-1.5">
                          <input
                            type="text"
                            inputMode={getInputMode(contextType) as React.HTMLAttributes<HTMLInputElement>['inputMode']}
                            pattern={getInputPattern(contextType)}
                            placeholder={getInputPlaceholder(contextType) || t('segments.targetingRules.valuePlaceholder')}
                            className="w-full bg-secondary border border-border rounded-md px-2.5 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all invalid:border-red-400 dark:invalid:border-red-500"
                            onInput={(e) => {
                              const input = e.target as HTMLInputElement;
                              const v = input.value.trim();
                              if (!v) { input.setCustomValidity(''); return; }
                              if (contextType === 'number' && isNaN(Number(v))) input.setCustomValidity('invalid');
                              else if (contextType === 'time' && !/^\d{2}:\d{2}$/.test(v)) input.setCustomValidity('invalid');
                              else if (contextType === 'semver' && !/^\d+\.\d+\.\d+(-.*)?$/.test(v)) input.setCustomValidity('invalid');
                              else input.setCustomValidity('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                const v = (e.target as HTMLInputElement).value.trim();
                                if (!v) return;
                                if (contextType === 'number' && isNaN(Number(v))) return;
                                if (contextType === 'time' && !/^\d{2}:\d{2}$/.test(v)) return;
                                if (contextType === 'semver' && !/^\d+\.\d+\.\d+(-.*)?$/.test(v)) return;
                                addValue(c.id, v);
                                (e.target as HTMLInputElement).value = '';
                                (e.target as HTMLInputElement).setCustomValidity('');
                              }
                            }}
                          />
                          {contextType !== 'string' && (
                            <p className="text-[11px] text-muted-foreground/60 ml-0.5">{getInputHint(contextType)}</p>
                          )}
                        </div>
                        <label className="cursor-pointer text-indigo-500 hover:text-indigo-400 transition-colors shrink-0" title={t('segments.targetingRules.uploadTooltip')}>
                          <Upload size={14} />
                          <input type="file" accept=".txt,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(c.id, f); e.target.value = ''; }} />
                        </label>
                      </div>
                      {parsedValues.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {parsedValues.map((v, vi) => (
                            <span key={vi} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 rounded-md break-all leading-none">
                              {v}
                              <button onClick={(e) => { e.stopPropagation(); removeValue(c.id, vi); }} className="text-emerald-500 hover:text-red-500 transition-colors"><X size={11} /></button>
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground self-center ml-1">{t('segments.targetingRules.valueCount', { count: String(parsedValues.length) })}</span>
                        </div>
                      )}
                    </div>
                    )}
                  </ConstraintRow>
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
