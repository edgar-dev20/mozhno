import { useState } from 'react';
import {
  Plus,
  Users,
  Filter,
  Settings,
  X,
  PieChart,
  Upload,
  ChevronDown,
  Trash2,
} from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { TipCard } from '@/app/components/TipCard';
import { SidePanel } from '@/app/components/SidePanel';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { InlineDiffBar } from '@/app/components/InlineDiffBar';
import { computeDiff, DiffChange } from '@/shared/diffUtils';
import { SegmentIcon, SegmentIconPicker, SegmentColorPicker } from '@/app/components/SegmentIcon';
import { DateTimePicker } from '@/shared/components/DateTimePicker';
import { ContextType } from '@/app/components/contextTypes';
import { Operator, isMultiOperator } from '@/app/components/operatorsMeta';
import { SegmentResponse } from '@/api';
import {
  getDefaultOperator,
  isValidOperator,
  getInputPlaceholder,
  getInputPattern,
  getInputHint,
  getInputMode,
  getInlineValidationError,
} from '@/app/components/operators';
import { OperatorBadge } from '@/app/components/OperatorBadge';
import { ConstraintRow } from '@/app/components/ConstraintRow';
import { formatTimeConstraintValue } from '@/shared/format';
import {
  SectionHeader,
  EmptyState,
  ColorBar,
  ColorIcon,
  FormField,
  GradientButton,
  ErrorBox,
  Badge,
  getErrorMessage,
} from '@/shared';
import { SegmentCardSkeletonList } from '@/app/components/skeletons';
import { useT } from '@/i18n';

import { useSegments } from '@/app/hooks/useSegments';

interface SegmentContextEntry {
  id: string;
  contextDefinitionId: number;
  operator: string;
  contextValues: string;
}

export function Segments() {
  const t = useT();
  const { segments, contexts, loading, error, setError, handleDelete, handleSave } = useSegments();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<SegmentResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Users');
  const [formColor, setFormColor] = useState('#1a6b60');
  const [formContexts, setFormContexts] = useState<SegmentContextEntry[]>([]);
  const [, setInitialSegment] = useState<{
    name: string;
    desc: string;
    icon: string;
    color: string;
    contexts: SegmentContextEntry[];
  } | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [activeConditionId, setActiveConditionId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [diffChanges, setDiffChanges] = useState<DiffChange[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const updateName = (v: string) => { setFormName(v); setIsDirty(true); };
  const updateDesc = (v: string) => { setFormDesc(v); setIsDirty(true); };
  const updateIcon = (v: string) => { setFormIcon(v); setIsDirty(true); };
  const updateColor = (v: string) => { setFormColor(v); setIsDirty(true); };
  const updateContexts: typeof setFormContexts = (arg) => { setFormContexts(arg); setIsDirty(true); };

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormDesc('');
    setFormIcon('Users');
    setFormColor('#1a6b60');
    setFormContexts([]);
    setError('');
    setShowCustomize(false);
    setActiveConditionId(null);
    setInitialSegment(null);
    setDiffChanges([]);
    setIsDirty(false);
    setPanelOpen(true);
  };
  const openEdit = (s: SegmentResponse) => {
    setEditing(s);
    setFormName(s.name);
    setFormDesc(s.description ?? '');
    setFormIcon(s.icon ?? 'Users');
    setFormColor(s.color ?? '#1a6b60');
    const initContexts = (s.context ?? []).map((c, i) => {
      const ctx = contexts.find((cd) => cd.id === c.contextDefinitionId);
      const op = c.operator ?? Operator.IN;
      return {
        id: `sc-${Date.now()}-${i}`,
        contextDefinitionId: c.contextDefinitionId,
        operator: isValidOperator(ctx?.type, op) ? op : getDefaultOperator(ctx?.type),
        contextValues: c.contextValues,
      };
    });
    setFormContexts(initContexts);
    setInitialSegment({
      name: s.name,
      desc: s.description ?? '',
      icon: s.icon ?? 'Users',
      color: s.color ?? '#1a6b60',
      contexts: JSON.parse(JSON.stringify(initContexts)),
    });
    setError('');
    setShowCustomize(false);
    setActiveConditionId(null);
    setDiffChanges([]);
    setIsDirty(false);
    setPanelOpen(true);
  };

  const addContext = () => {
    updateContexts((prev) => [
      ...prev,
      { id: `sc-${Date.now()}`, contextDefinitionId: 0, operator: Operator.IN, contextValues: '' },
    ]);
  };

  const doDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await handleDelete(deleteId);
      setDeleteId(null);
      setPanelOpen(false);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  const removeContext = (id: string) => updateContexts((prev) => prev.filter((c) => c.id !== id));

  const addValue = (id: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    updateContexts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const isMulti = isMultiOperator(c.operator);
        if (isMulti) {
          const existing = c.contextValues
            ? c.contextValues
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean)
            : [];
          if (existing.includes(trimmed)) return c;
          return { ...c, contextValues: existing.concat(trimmed).join(', ') };
        }
        return { ...c, contextValues: trimmed };
      }),
    );
  };

  const removeValue = (id: string, index: number) => {
    updateContexts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const values = (c.contextValues ?? '')
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        values.splice(index, 1);
        return { ...c, contextValues: values.join(', ') };
      }),
    );
  };

  const handleFileUpload = (id: string, file: File) => {
    const MAX_SIZE = 1_048_576;
    if (file.size > MAX_SIZE) {
      setError(
        t('segments.errors.fileTooBig', { size: String((MAX_SIZE / 1024 / 1024).toFixed(1)) }),
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const newValues = text
        .split(/[\n\r,]+/)
        .map((v) => v.trim())
        .filter(Boolean);
      updateContexts((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const existing = (c.contextValues ?? '')
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
          const merged = [...new Set([...existing, ...newValues])];
          return { ...c, contextValues: merged.join(', ') };
        }),
      );
    };
    reader.readAsText(file);
  };

  const doSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (editing) {
        const renderCtxLines = (
          rules: { contextDefinitionId: number; operator: string; contextValues: string }[],
        ) => {
          if (rules.length === 0) return <span className="text-muted-foreground/50 italic">—</span>;
          return (
            <div className="space-y-1">
              {rules.map((r, i) => {
                const ctx = contexts.find((cd) => cd.id === r.contextDefinitionId);
                const sCtxType = ctx?.type;
                const sDisplayValues =
                  sCtxType === ContextType.TIME
                    ? (r.contextValues || '')
                        .split(',')
                        .map((v) => formatTimeConstraintValue(v.trim()))
                        .join(', ')
                    : r.contextValues || '—';
                return (
                  <div key={i} className="flex items-center gap-1.5 text-caption">
                    <span className="font-semibold text-foreground/80">
                      {ctx?.name ??
                        t('segments.unknownField', { id: String(r.contextDefinitionId) })}
                    </span>
                    <OperatorBadge operator={r.operator ?? Operator.IN} contextType={sCtxType} />
                    <code className="font-mono text-success break-all">{sDisplayValues}</code>
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
          color: editing.color ?? '#1a6b60',
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

        const contextAfter = formContexts.map((c) => ({
          contextDefinitionId: c.contextDefinitionId,
          operator: c.operator,
          contextValues: c.contextValues,
        }));
        const beforeCtxStr = (editing.context ?? [])
          .map((c) => `${c.contextDefinitionId}:${c.operator}:${c.contextValues}`)
          .join('|');
        const afterCtxStr = contextAfter
          .map((c) => `${c.contextDefinitionId}:${c.operator}:${c.contextValues}`)
          .join('|');

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
      const context = formContexts.map((c) => ({
        contextDefinitionId: c.contextDefinitionId,
        operator: c.operator,
        contextValues: c.contextValues,
      }));
      await handleSave(editing, {
        name: formName,
        description: formDesc,
        icon: formIcon,
        color: formColor,
        context,
      });
      setPanelOpen(false);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmApplyDiff = async () => {
    setDiffChanges([]);
    setSaving(true);
    try {
      const context = formContexts.map((c) => ({
        contextDefinitionId: c.contextDefinitionId,
        operator: c.operator,
        contextValues: c.contextValues,
      }));
      await handleSave(editing, {
        name: formName,
        description: formDesc,
        icon: formIcon,
        color: formColor,
        context,
      });
      setPanelOpen(false);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader title={t('segments.title')} description={t('segments.description')} />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>
          {t('segments.create')}
        </GradientButton>
      </div>

      <TipCard
        text={t('segments.tipText')}
        label={t('segments.tipLabel')}
        icon={<PieChart />}
        storageKey="segments"
      />

      {loading ? (
        <SegmentCardSkeletonList count={3} />
      ) : segments.length === 0 ? (
        <EmptyState
          icon={<SegmentIcon name="Users" size={28} className="text-brand dark:text-brand" />}
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
                <ColorBar color={s.color || '#1a6b60'} />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <ColorIcon
                      size="lg"
                      color={s.color || '#1a6b60'}
                      icon={<SegmentIcon name={s.icon || 'Users'} size={24} />}
                      shadow
                      onClick={() => openEdit(s)}
                    />
                  </div>
                  <h3
                    className="text-h2 font-semibold text-foreground mb-1.5 cursor-pointer hover:text-foreground/60 dark:hover:text-muted-foreground/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded"
                    onClick={() => openEdit(s)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openEdit(s);
                      }
                    }}
                  >
                    {s.name}
                  </h3>
                  <p className="text-body-sm text-muted-foreground mb-6 line-clamp-2 h-10">
                    {s.description}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-body-sm">
                      <Users size={16} className="text-muted-foreground/70" />
                      <span className="text-foreground/60 dark:text-muted-foreground/60">
                        {t('segments.contextCount', { count: String((s.context ?? []).length) })}
                      </span>
                    </div>
                    {s.context && s.context.length > 0 && (
                      <div className="bg-secondary rounded-lg p-3 border border-border flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-caption font-semibold text-muted-foreground/80 uppercase tracking-wider">
                          <Filter size={12} />
                          {t('segments.rules')}
                        </div>
                        <div className="space-y-1">
                          {s.context.map((c, ci) => {
                            const ctxDef = contexts.find((cd) => cd.id === c.contextDefinitionId);
                            const sCtxType = ctxDef?.type;
                            const sDisplayValues =
                              sCtxType === ContextType.TIME
                                ? (c.contextValues || '')
                                    .split(',')
                                    .map((v) => formatTimeConstraintValue(v.trim()))
                                    .join(', ')
                                : c.contextValues;
                            return (
                              <div key={ci} className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-semibold text-foreground/80">
                                  {ctxDef?.name ??
                                    t('segments.unknownField', {
                                      id: String(c.contextDefinitionId),
                                    })}
                                </span>
                                <OperatorBadge
                                  operator={c.operator ?? Operator.IN}
                                  contextType={sCtxType}
                                />
                                <span className="text-foreground/80 break-all line-clamp-1">
                                  {sDisplayValues}
                                </span>
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
        footer={
          diffChanges.length > 0 ? (
            <>
              <button
                onClick={() => setDiffChanges([])}
                className="inline-flex items-center px-5 py-2.5 text-body-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors"
              >
                {t('segments.panel.cancel')}
              </button>
              <GradientButton
                onClick={confirmApplyDiff}
                loading={saving}
              >
                {t('common.applyChanges')}
              </GradientButton>
            </>
          ) : (
            <>
              <button
                onClick={() => setPanelOpen(false)}
                className="inline-flex items-center px-5 py-2.5 text-body-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors"
              >
                {t('segments.panel.cancel')}
              </button>
              <GradientButton
                onClick={doSave}
                disabled={
                  saving ||
                  !formName ||
                  (editing != null && !isDirty)
                }
                loading={saving}
              >
                {editing ? t('common.saveChanges') : t('segments.panel.create')}
              </GradientButton>
            </>
          )
        }
      >
        <div className="space-y-5">
          {error && <ErrorBox>{error}</ErrorBox>}

          <FormField label={t('common.name')} maxLength={120} value={formName}>
            <input
              type="text"
              value={formName}
              onChange={(e) => updateName(e.target.value)}
              maxLength={120}
              placeholder={t('segments.form.namePlaceholder')}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-body-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground"
            />
          </FormField>
          <FormField label={t('common.description')} maxLength={160} value={formDesc}>
            <textarea
              value={formDesc}
              onChange={(e) => updateDesc(e.target.value)}
              maxLength={160}
              placeholder={t('segments.form.descriptionPlaceholder')}
              rows={2}
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = Math.max(el.scrollHeight, 64) + 'px';
                }
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.max(el.scrollHeight, 64) + 'px';
              }}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none overflow-hidden"
            />
          </FormField>

          <div className="pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ColorIcon
                  size="md"
                  color={formColor}
                  icon={<SegmentIcon name={formIcon} size={15} />}
                  shadow
                />
                <div className="text-left">
                  <div className="text-body-sm font-medium text-foreground/80">
                    {t('segments.customize.title')}
                  </div>
                  <div className="text-caption text-muted-foreground/70">
                    {t('segments.customize.subtitle')}
                  </div>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted-foreground group-hover:text-foreground/60 dark:group-hover:text-muted-foreground/60 transition-transform duration-200 ${showCustomize ? 'rotate-180' : ''}`}
              />
            </button>

            {showCustomize && (
              <div className="mt-3 space-y-4 px-2">
                <div>
                  <label className="text-caption font-medium text-muted-foreground mb-2 block">
                    {t('common.icon')}
                  </label>
                  <SegmentIconPicker value={formIcon} onChange={updateIcon} color={formColor} />
                </div>
                <div>
                  <label className="text-caption font-medium text-muted-foreground mb-2 block">
                    {t('common.color')}
                  </label>
                  <SegmentColorPicker value={formColor} onChange={updateColor} icon={formIcon} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-brand dark:text-brand" />
                <label className="text-body-sm font-medium text-foreground/80">
                  {t('segments.targetingRules.title')}
                </label>
                <Badge variant="primary" size="sm">
                  {t('segments.targetingRules.badge')}
                </Badge>
              </div>
              <button
                onClick={addContext}
                className="text-caption text-brand dark:text-brand hover:text-brand flex items-center gap-1 font-medium"
              >
                <Plus size={12} />
                {t('segments.targetingRules.add')}
              </button>
            </div>
            <div className="space-y-1.5">
              {formContexts.map((c) => {
                const isActive = activeConditionId === c.id;
                const parsedValues = (c.contextValues ?? '')
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean);
                const ctxDef = contexts.find((cd) => cd.id === c.contextDefinitionId);
                const sCtxType = ctxDef?.type;
                const formatRowValues = (vals: string[]): string => {
                  if (vals.length === 0) return '∅';
                  const displayed =
                    sCtxType === ContextType.TIME ? vals.map(formatTimeConstraintValue) : vals;
                  if (displayed.length === 1) return displayed[0];
                  const display = displayed.slice(0, 3).join(', ');
                  return displayed.length > 3 ? `[${display}, ...]` : `[${display}]`;
                };

                const updateEntry = (upd: Partial<SegmentContextEntry>) => {
                  updateContexts((prev) =>
                    prev.map((e) => (e.id === c.id ? { ...e, ...upd } : e)),
                  );
                };

                const handleToggle = () => setActiveConditionId(isActive ? null : c.id);

                const handleRemove = () => {
                  removeContext(c.id);
                  setActiveConditionId(null);
                };

                const handleContextChange = (ctxId: number) => {
                  const ctx = contexts.find((cd) => cd.id === ctxId);
                  updateEntry({
                    contextDefinitionId: ctxId,
                    operator: getDefaultOperator(ctx?.type),
                  });
                };

                const handleOperatorChange = (op: string) => {
                  const isCurrentlyMulti = isMultiOperator(c.operator);
                  const newIsMulti = isMultiOperator(op);
                  if (isCurrentlyMulti && !newIsMulti) {
                    const vals = (c.contextValues ?? '')
                      .split(',')
                      .map((v) => v.trim())
                      .filter(Boolean);
                    if (vals.length > 1) {
                      updateEntry({ operator: op, contextValues: vals[0] });
                      return;
                    }
                  }
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
                    {(contextType) => {
                      const ctxDef = Array.isArray(contexts) ? contexts.find((cd) => cd.id === c.contextDefinitionId) : undefined;
                      const validVals = ctxDef?.validValues ?? [];
                      const strict = ctxDef?.isStrict ?? false;
                      const hasWhitelist = validVals.length > 0;

                      return (
                      <div className="space-y-3">
                        <div className="flex items-start gap-1.5">
                          <div className="flex-1 space-y-1.5">
                            {contextType === ContextType.TIME ? (
                              <DateTimePicker
                                onChange={(iso) => {
                                  if (!iso) return;
                                  addValue(c.id, iso);
                                }}
                                placeholder={t('segments.targetingRules.valuePlaceholder')}
                              />
                            ) : strict && hasWhitelist ? (
                              <div className="flex flex-wrap gap-1.5">
                                {validVals.map((v) => {
                                  const isMultiOp = isMultiOperator(c.operator);
                                  const isSelected = parsedValues.includes(v);
                                  if (isMultiOp && isSelected) return null;
                                  return (
                                    <button
                                      key={v}
                                      onClick={() => {
                                        if (getInlineValidationError(contextType, v)) return;
                                        addValue(c.id, v);
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-all border ${
                                        !isMultiOp && isSelected
                                          ? 'bg-brand/10 text-brand border-brand/20'
                                          : 'bg-secondary/80 text-foreground/70 hover:bg-secondary hover:text-foreground border-border'
                                      }`}
                                    >
                                      {!isMultiOp && isSelected ? v : `+ ${v}`}
                                    </button>
                                  );
                                })}
                                {validVals.length === 0 && (
                                  <p className="text-caption text-muted-foreground">
                                    {t('segments.targetingRules.valuePlaceholder')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <input
                                type="text"
                                inputMode={
                                  getInputMode(
                                    contextType,
                                  ) as React.HTMLAttributes<HTMLInputElement>['inputMode']
                                }
                                pattern={getInputPattern(contextType)}
                                placeholder={
                                  getInputPlaceholder(contextType) ||
                                  t('segments.targetingRules.valuePlaceholder')
                                }
                                list={hasWhitelist ? `seg-wl-${c.id}` : undefined}
                                className="w-full bg-secondary border border-border rounded-md px-2.5 py-2 text-caption placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all invalid:border-destructive dark:invalid:border-destructive"
                                onInput={(e) => {
                                  const input = e.target as HTMLInputElement;
                                  input.setCustomValidity(
                                    getInlineValidationError(contextType, input.value.trim()),
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    const v = (e.target as HTMLInputElement).value.trim();
                                    if (!v) return;
                                    if (getInlineValidationError(contextType, v)) return;
                                    addValue(c.id, v);
                                    (e.target as HTMLInputElement).value = '';
                                    (e.target as HTMLInputElement).setCustomValidity('');
                                  }
                                }}
                              />
                            )}
                            {hasWhitelist && !strict && (
                              <datalist id={`seg-wl-${c.id}`}>
                                {validVals.map((v) => (
                                  <option key={v} value={v} />
                                ))}
                              </datalist>
                            )}
                            {hasWhitelist && !strict && validVals.some((v) => !parsedValues.includes(v)) && (
                              <div className="pt-1">
                                <p className="text-[11px] text-muted-foreground mb-1">
                                  {t('segments.targetingRules.availableValues')}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {validVals
                                    .filter((v) => !parsedValues.includes(v))
                                    .map((v) => (
                                      <button
                                        key={v}
                                        onClick={() => addValue(c.id, v)}
                                        className="px-2 py-0.5 text-caption border border-brand/20 rounded-md text-brand hover:bg-brand/10 transition-colors"
                                      >
                                        + {v}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}
                            {contextType !== ContextType.STRING && contextType !== ContextType.TIME && (
                              <p className="text-[11px] text-muted-foreground/60 ml-0.5">
                                {getInputHint(contextType)}
                              </p>
                            )}
                          </div>
                          {!strict && (
                          <label
                            className="cursor-pointer text-brand hover:text-brand transition-colors shrink-0"
                            title={t('segments.targetingRules.uploadTooltip')}
                          >
                            <Upload size={14} />
                            <input
                              type="file"
                              accept=".txt,.csv"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(c.id, f);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          )}
                        </div>
                        {parsedValues.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {parsedValues.map((v, vi) => {
                              const inWhitelist = !strict || !hasWhitelist || validVals.includes(v);
                              return (
                              <span
                                key={vi}
                                className={`inline-flex items-center gap-1 px-2 py-1 text-caption font-mono rounded-md border break-all leading-none ${
                                  inWhitelist
                                    ? 'bg-success/10 text-success border-success/20'
                                    : 'bg-warning/10 text-warning border-warning/30'
                                }`}
                              >
                                {v}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeValue(c.id, vi);
                                  }}
                                  className={`${inWhitelist ? 'text-success' : 'text-warning'} hover:text-destructive transition-colors`}
                                >
                                  <X size={11} />
                                </button>
                              </span>
                              );
                            })}
                            <span className="text-caption text-muted-foreground self-center ml-1">
                              {t('segments.targetingRules.valueCount', {
                                count: String(parsedValues.length),
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      );
                    }}
                  </ConstraintRow>
                );
              })}
              {formContexts.length === 0 && (
                <div className="p-4 bg-input-background rounded-lg border border-dashed border-border dark:border-border text-center">
                  <p className="text-caption text-muted-foreground">
                    {t('segments.targetingRules.emptyRules')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-brand/10 dark:bg-brand/10 border border-brand/20 rounded-lg">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-brand dark:bg-brand flex items-center justify-center">
                  <Settings size={12} className="text-primary-foreground" />
                </div>
              </div>
              <div>
                <h5 className="text-caption font-semibold text-foreground mb-1">
                  {t('segments.infoBox.title')}
                </h5>
                <p className="text-caption text-muted-foreground">
                  {t('segments.infoBox.description')}
                </p>
              </div>
            </div>
          </div>

          {editing && (
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteId(editing.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-body-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg border border-destructive/20 transition-all"
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
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('segments.deleteConfirm.title')}
        description={t('segments.deleteConfirm.description', {
          name: segments.find((s) => s.id === deleteId)?.name ?? '',
        })}
        confirmLabel={t('common.delete')}
        onConfirm={doDelete}
        loading={deleting}
      />
    </div>
  );
}
