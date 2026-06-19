import { useState, useMemo } from 'react';
import { Plus, Trash2, Box, Braces, Clock, User, Type, Settings2, X, Upload } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SidePanel } from '@/app/components/SidePanel';
import { TipCard } from '@/app/components/TipCard';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { InlineDiffBar } from '@/app/components/InlineDiffBar';
import type { DiffChange } from '@/shared/diffUtils';
import { SegmentIcon } from '@/app/components/SegmentIcon';
import { ContextType, CONTEXT_TYPES } from '@/app/components/contextTypes';
import { api, ContextDefinition, SegmentResponse } from '@/api';
import { SectionHeader, EmptyState, FormField, GradientButton, ErrorBox, Badge, getErrorMessage } from '@/shared';
import { TableSkeleton } from '@/app/components/skeletons';
import { useProjectQuery, useContextsQuery, useSegmentsQuery } from '@/app/hooks/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useT } from '@/i18n';
import { Switch } from '@/app/components/ui/switch';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  [ContextType.STRING]: <Type size={13} />,
  [ContextType.NUMBER]: <span className="text-sm font-semibold">123</span>,
  [ContextType.TIME]: <Clock size={13} />,
  [ContextType.SEMVER]: <Settings2 size={13} />,
};
const TYPE_COLORS: Record<string, string> = {
  [ContextType.STRING]: '#3b82f6',
  [ContextType.NUMBER]: '#f97316',
  [ContextType.TIME]: '#06b6d4',
  [ContextType.SEMVER]: '#8b5cf6',
};
const TYPE_COLORS_BAR: Record<string, string> = {
  '#3b82f6': 'linear-gradient(to right, #3b82f6, #93bbfd)',
  '#f97316': 'linear-gradient(to right, #f97316, #fdba74)',
  '#06b6d4': 'linear-gradient(to right, #06b6d4, #67e8f9)',
  '#8b5cf6': 'linear-gradient(to right, #8b5cf6, #6ee7b7)',
};

import { loadLocale, toIntlLocale } from '@/i18n/locale';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(toIntlLocale(loadLocale()), {
    day: 'numeric',
    month: 'short',
  });
}

export function Constraints() {
  const t = useT();
  const queryClient = useQueryClient();

  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: contexts = [], isLoading: contextsLoading } = useContextsQuery();
  const { data: segments = [], isLoading: segmentsLoading } = useSegmentsQuery();

  const loading = contextsLoading || segmentsLoading;

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<ContextDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formType, setFormType] = useState(ContextType.STRING);
  const [formDesc, setFormDesc] = useState('');
  const [formIsStrict, setFormIsStrict] = useState(false);
  const [formValidValues, setFormValidValues] = useState<string[]>([]);
  const [valueInput, setValueInput] = useState('');
  const [error, setError] = useState('');
  const [keyError, setKeyError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [diffChanges, setDiffChanges] = useState<DiffChange[]>([]);

  const typeLabels: Record<string, string> = {
    [ContextType.STRING]: t('constraints.typeLabel.string'),
    [ContextType.NUMBER]: t('constraints.typeLabel.number'),
    [ContextType.TIME]: t('constraints.typeLabel.time'),
    [ContextType.SEMVER]: t('constraints.typeLabel.semver'),
  };

  const segmentUsage = useMemo(() => {
    const map = new Map<number, SegmentResponse[]>();
    for (const s of segments) {
      for (const c of s.context) {
        if (!map.has(c.contextDefinitionId)) map.set(c.contextDefinitionId, []);
        map.get(c.contextDefinitionId)!.push(s);
      }
    }
    return map;
  }, [segments]);

  const editingUsage = editing ? segmentUsage.get(editing.id) : undefined;
  const canDelete = editing ? !editingUsage || editingUsage.length === 0 : false;
  const isDirty = editing
    ? formName !== editing.name ||
      formKey !== editing.key ||
      formType !== (editing.type ?? ContextType.STRING) ||
      formDesc !== (editing.description ?? '') ||
      formIsStrict !== (editing.isStrict ?? false) ||
      JSON.stringify(formValidValues) !== JSON.stringify(editing.validValues ?? [])
    : true;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.contexts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.contexts.all });
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
      let saved: ContextDefinition;
      const valuesStr = formValidValues.join(', ');
      if (editing) {
        saved = await api.contexts.update(editing.id, {
          name: formName,
          key: formKey,
          type: formType,
          description: formDesc,
          isStrict: formIsStrict,
        });
      } else {
        saved = await api.contexts.create({
          name: formName,
          key: formKey,
          type: formType,
          description: formDesc,
          isStrict: formIsStrict,
        });
      }
      await api.contexts.values.upsert(saved.id, valuesStr);
      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      queryClient.invalidateQueries({ queryKey: queryKeys.contexts.all });
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      setError(getErrorMessage(e));
    },
    onSettled: () => setSaving(false),
  });

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormKey('');
    setFormType(ContextType.STRING);
    setFormDesc('');
    setFormIsStrict(false);
    setFormValidValues([]);
    setValueInput('');
    setError('');
    setKeyError('');
    setPanelOpen(true);
  };
  const openEdit = (c: ContextDefinition) => {
    setEditing(c);
    setFormName(c.name);
    setFormKey(c.key);
    setFormType(c.type ?? ContextType.STRING);
    setFormDesc(c.description ?? '');
    setFormIsStrict(c.isStrict ?? false);
    setFormValidValues(c.validValues ?? []);
    setValueInput('');
    setError('');
    setKeyError('');
    setPanelOpen(true);
  };

  const handleDelete = () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    deleteMutation.mutate(deleteId);
  };

  const handleSave = () => {
    if (!projectId) return;
    setError('');
    setKeyError('');
    if (!/^[a-zA-Z0-9_]+$/.test(formKey)) {
      setKeyError(t('constraints.keyValidationError'));
      return;
    }

    if (editing) {
      const changes: DiffChange[] = [];

      if (editing.name !== formName) {
        changes.push({
          field: 'name',
          label: t('common.name'),
          before: editing.name,
          after: formName,
          group: t('constraints.diffGroupSettings'),
        });
      }
      if (editing.key !== formKey) {
        changes.push({
          field: 'key',
          label: t('common.key'),
          before: editing.key,
          after: formKey,
          group: t('constraints.diffGroupSettings'),
        });
      }
      if ((editing.type ?? ContextType.STRING) !== formType) {
        changes.push({
          field: 'type',
          label: t('common.type'),
          before: typeLabels[editing.type ?? ContextType.STRING],
          after: typeLabels[formType],
          group: t('constraints.diffGroupSettings'),
        });
      }
      if ((editing.description ?? '') !== formDesc) {
        changes.push({
          field: 'description',
          label: t('common.description'),
          before: editing.description ?? '',
          after: formDesc,
          group: t('constraints.diffGroupSettings'),
        });
      }
      if ((editing.isStrict ?? false) !== formIsStrict) {
        changes.push({
          field: 'isStrict',
          label: t('constraints.strictModeLabel'),
          before: editing.isStrict ? 'Yes' : 'No',
          after: formIsStrict ? 'Yes' : 'No',
          group: t('constraints.diffGroupSettings'),
        });
      }
      const beforeVals = (editing.validValues ?? []).join(', ');
      const afterVals = formValidValues.join(', ');
      if (beforeVals !== afterVals) {
        changes.push({
          field: 'validValues',
          label: t('constraints.validValuesLabel'),
          before: beforeVals || t('constraints.none'),
          after: afterVals || t('constraints.none'),
          group: t('constraints.diffGroupSettings'),
        });
      }

      if (changes.length > 0) {
        setDiffChanges(changes);
        return;
      }
    }

    setSaving(true);
    saveMutation.mutate();
  };

  const confirmSave = () => {
    setDiffChanges([]);
    setSaving(true);
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader title={t('constraints.title')} description={t('constraints.description')} />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>
          {t('constraints.create')}
        </GradientButton>
      </div>

      <TipCard
        text={t('constraints.tipText')}
        label={t('constraints.tipLabel')}
        icon={<Braces />}
        storageKey="constraints"
      />

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : contexts.length === 0 ? (
        <EmptyState
          icon={<Box size={28} className="text-sky-400 dark:text-sky-500" />}
          title={t('constraints.emptyTitle')}
          description={t('constraints.emptyDescription')}
          buttonLabel={t('constraints.create')}
          onAction={openCreate}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contexts.map((c, idx) => {
              const usage = segmentUsage.get(c.id);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => openEdit(c)}
                >
                  <div
                    className="h-1.5"
                    style={{
                      background:
                        TYPE_COLORS_BAR[TYPE_COLORS[c.type ?? ContextType.STRING]] ??
                        `linear-gradient(to right, ${TYPE_COLORS[c.type ?? ContextType.STRING]}, ${TYPE_COLORS[c.type ?? ContextType.STRING]}88)`,
                    }}
                  />
                  <div className="p-5">
                    <div className="flex gap-3">
                      <div className="shrink-0 pt-0.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: TYPE_COLORS[c.type ?? ContextType.STRING] + '18' }}
                        >
                          <span style={{ color: TYPE_COLORS[c.type ?? ContextType.STRING] }}>
                            {TYPE_ICONS[c.type ?? ContextType.STRING]}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-sm text-foreground truncate">
                            {c.name}
                          </span>
                          <code className="text-xs font-mono text-muted-foreground shrink-0">
                            {c.key}
                          </code>
                        </div>
                        {c.description && (
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                            {c.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                          {c.createdAt && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(c.createdAt)}
                            </span>
                          )}
                          {c.createdBy && (
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {c.createdBy}
                            </span>
                          )}
                        </div>
                        {usage && usage.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {usage.map((s) => (
                              <span
                                key={s.id}
                                className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-1 rounded-md leading-none"
                                style={{ color: s.color, backgroundColor: s.color + '14' }}
                              >
                                <SegmentIcon name={s.icon} size={10} />
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={editing ? editing.name : t('constraints.panelTitleNew')}
        description=""
        diffSlot={diffChanges.length > 0 ? <InlineDiffBar changes={diffChanges} /> : undefined}
        onDiffDismiss={diffChanges.length > 0 ? () => setDiffChanges([]) : undefined}
        footer={
          diffChanges.length > 0 ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1" />
              <GradientButton variant="ghost" onClick={() => setDiffChanges([])}>
                {t('common.cancel')}
              </GradientButton>
              <GradientButton onClick={confirmSave} loading={saving}>
                {t('common.applyChanges')}
              </GradientButton>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1" />
              <GradientButton variant="ghost" onClick={() => setPanelOpen(false)}>
                {t('common.cancel')}
              </GradientButton>
              <GradientButton
                onClick={handleSave}
                disabled={saving || !formName || !formKey || !isDirty}
                loading={saving}
              >
                {editing ? t('common.saveChanges') : t('common.create')}
              </GradientButton>
            </div>
          )
        }
      >
        {error && <ErrorBox className="mb-5">{error}</ErrorBox>}

        <div className="space-y-5">
          <FormField label={t('common.name')} maxLength={120} value={formName}>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              maxLength={120}
              placeholder="User ID"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground"
            />
          </FormField>
          <FormField
            label={t('common.key')}
            hint={
              editing ? (
                <>
                  {t('constraints.keyHintEditPrefix')}
                  <code className="text-xs font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">
                    context['{formKey}']
                  </code>
                </>
              ) : (
                <>
                  {t('constraints.keyHintCreatePrefix')}
                  <code className="text-xs font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">
                    context['user_id']
                  </code>
                </>
              )
            }
            maxLength={100}
            value={formKey}
          >
            <input
              type="text"
              value={formKey}
              onChange={(e) => {
                setFormKey(e.target.value);
                setKeyError('');
              }}
              maxLength={100}
              placeholder="user_id"
              disabled={!!editing}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary/50"
            />
            {keyError && <p className="text-xs text-destructive mt-1">{keyError}</p>}
          </FormField>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">{t('common.type')}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {CONTEXT_TYPES.map((tp) => (
                <button
                  key={tp}
                  onClick={() => {
                    if (!editing) setFormType(tp);
                  }}
                  disabled={!!editing && formType !== tp}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border text-xs font-medium transition-all duration-150 ${formType === tp ? 'border-current/30' : editing ? 'border-border text-muted-foreground/40 cursor-not-allowed' : 'border-border text-muted-foreground hover:border-border hover:text-foreground/60 dark:hover:text-muted-foreground/60'}`}
                  style={
                    formType === tp
                      ? { color: TYPE_COLORS[tp], backgroundColor: TYPE_COLORS[tp] + '12' }
                      : undefined
                  }
                >
                  <span className={formType === tp ? '' : 'text-muted-foreground'}>
                    {TYPE_ICONS[tp]}
                  </span>
                  <span className="text-center leading-none">{typeLabels[tp]}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('constraints.typeHelpText')}
            </p>
          </div>
          <FormField label={t('common.description')} maxLength={160} value={formDesc}>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              maxLength={160}
              rows={2}
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = Math.max(el.scrollHeight, 72) + 'px';
                }
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.max(el.scrollHeight, 72) + 'px';
              }}
              placeholder={t('constraints.placeholderDescription')}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none overflow-hidden leading-relaxed"
            />
          </FormField>

          <div className="pt-5 border-t border-border space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground/80">
                  {t('constraints.strictModeLabel')}
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('constraints.strictModeHint')}
                </p>
              </div>
              <Switch
                checked={formIsStrict}
                onCheckedChange={setFormIsStrict}
                className="!bg-switch-background data-[state=checked]:!bg-brand dark:data-[state=checked]:!bg-brand"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                {t('constraints.validValuesLabel')}
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                {t('constraints.validValuesHint')}
              </p>
              <div className="flex items-start gap-1.5 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    placeholder={t('constraints.valuePlaceholder')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const v = valueInput.trim();
                        if (!v) return;
                        if (!formValidValues.includes(v)) {
                          setFormValidValues((prev) => [...prev, v]);
                        }
                        setValueInput('');
                      }
                    }}
                    className="w-full bg-secondary border border-border rounded-md px-2.5 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
                  />
                </div>
                <button
                  onClick={() => {
                    const v = valueInput.trim();
                    if (!v) return;
                    if (!formValidValues.includes(v)) {
                      setFormValidValues((prev) => [...prev, v]);
                    }
                    setValueInput('');
                  }}
                  className="shrink-0 px-3 py-2 text-xs font-medium text-brand hover:bg-brand/10 rounded-md border border-brand/20 transition-all"
                >
                  <Plus size={14} />
                </button>
                <label
                  className="cursor-pointer text-indigo-500 hover:text-indigo-400 transition-colors shrink-0 px-1 py-2"
                  title={t('constraints.uploadTooltip')}
                >
                  <Upload size={14} />
                  <input
                    type="file"
                    accept=".txt,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const MAX_SIZE = 1_048_576;
                      if (f.size > MAX_SIZE) {
                        toast.error(t('constraints.errors.fileTooBig', { size: '1' }));
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const text = (ev.target?.result as string) || '';
                        const newValues = text
                          .split(/[\n\r,]+/)
                          .map((v) => v.trim())
                          .filter(Boolean);
                        setFormValidValues((prev) => {
                          const merged = [...new Set([...prev, ...newValues])];
                          return merged;
                        });
                      };
                      reader.readAsText(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {formValidValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 pb-2">
                  {formValidValues.map((v, vi) => (
                    <span
                      key={vi}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-success/10 text-success border border-success/20 rounded-md break-all leading-none"
                    >
                      {v}
                      <button
                        onClick={() =>
                          setFormValidValues((prev) => prev.filter((_, i) => i !== vi))
                        }
                        className="text-emerald-500 hover:text-red-500 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground self-center ml-1">
                    {formValidValues.length} value{formValidValues.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {editingUsage && editingUsage.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <label className="text-sm font-medium text-foreground/80">
              {t('constraints.relatedSegmentsLabel')}
            </label>
            <div className="mt-3 flex flex-col gap-2">
              {editingUsage.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ borderColor: s.color + '40', backgroundColor: s.color + '0A' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: s.color + '20' }}
                  >
                    <SegmentIcon name={s.icon} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold" style={{ color: s.color }}>
                      {s.name}
                    </div>
                    {s.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {s.description}
                      </div>
                    )}
                  </div>
                  <Badge variant="destructive" shape="pill" uppercase>
                    {t('constraints.badgeInUse')}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              {t('constraints.cannotDeleteHelp')}
            </p>
          </div>
        )}

        {editing && (
          <div className="pt-6 border-t border-border space-y-3">
            {canDelete ? (
              <button
                onClick={() => setDeleteId(editing.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg border border-destructive/20"
              >
                <Trash2 size={16} />
                {t('constraints.deleteButton')}
              </button>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground/60 dark:text-muted-foreground/60 rounded-lg border border-border cursor-not-allowed"
              >
                <Trash2 size={16} />
                {t('constraints.deleteButton')}
              </button>
            )}
          </div>
        )}
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('constraints.confirmDeleteTitle')}
        description={t('constraints.confirmDeleteDescription', {
          name: contexts.find((c) => c.id === deleteId)?.name ?? '',
        })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
