import { useState, useCallback } from 'react';
import { useT } from '@/i18n';
import { loadLocale, toIntlLocale } from '@/i18n/locale';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  Server,
  Globe,
  Plus,
  Trash2,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Clock,
} from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { api, Environment } from '@/api';
import { TipCard } from '@/app/components/TipCard';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { SidePanel } from '@/app/components/SidePanel';
import { ApiKeyTableSkeleton } from '@/app/components/skeletons';
import { SectionHeader, GradientButton, EmptyState, SearchInput, ColorIcon, ErrorBox, getErrorMessage, getEnvColor, envColorStyles, Fab } from '@/shared';
import { EmptyKeysIllustration } from '@/shared/components/illustrations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { useProjectQuery, useEnvironmentsQuery } from '@/app/hooks/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';

export function ApiKeys() {
  const queryClient = useQueryClient();

  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: environments = [] } = useEnvironmentsQuery();

  const { data: keys = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.apiKeys.byProject(projectId),
    queryFn: () => api.apiKeys.list(),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showKey, setShowKey] = useState<number | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [envFilter, setEnvFilter] = useState<number | null>(null);
  const [displayLimit, setDisplayLimit] = useState(10);

  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formName, setFormName] = useState('');
  const [formEnvId, setFormEnvId] = useState<number | null>(null);
  const [formEnvError, setFormEnvError] = useState('');
  const [formKeyType, setFormKeyType] = useState('SERVER');
  const [formNameError, setFormNameError] = useState('');

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.apiKeys.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.byProject(projectId) });
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteId!);
        return next;
      });
      setDeleteId(null);
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e));
    },
    onSettled: () => setDeleting(false),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.apiKeys.create({
        name: formName,
        environmentId: formEnvId!,
        keyType: formKeyType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.byProject(projectId) });
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : t('apiKeys.errors.create'));
    },
    onSettled: () => setSaving(false),
  });

  const t = useT();

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setError('');
    setFormName('');
    setFormEnvId(null);
    setFormEnvError('');
    setFormNameError('');
    setFormKeyType('SERVER');
    setPanelOpen(true);
  };

  const handleCreate = () => {
    if (!projectId) return;
    let hasError = false;
    if (!formName.trim()) {
      setFormNameError(t('common.required'));
      hasError = true;
    } else {
      setFormNameError('');
    }
    if (!formEnvId) {
      setFormEnvError(t('apiKeys.formEnvRequired'));
      hasError = true;
    } else {
      setFormEnvError('');
    }
    if (hasError) return;
    setSaving(true);
    createMutation.mutate();
  };

  const handleDelete = () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    deleteMutation.mutate(deleteId);
  };

  const copyKey = async (id: number, key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const envName = (id: number | null) => environments.find((e) => e.id === id)?.name ?? '—';
  const envColorHex = (id: number | null) => {
    const env = id != null ? environments.find((e) => e.id === id) : undefined;
    return getEnvColor(env ?? id);
  };
  const getKeyTypeColor = (t: string) =>
    t === 'FRONTEND'
      ? 'text-palette-warning-600 dark:text-palette-warning-700 bg-warning/10 dark:bg-warning/10'
      : 'text-brand dark:text-brand bg-brand/10 dark:bg-brand/10';
  const getKeyTypeLabel = (t: string) => (t === 'FRONTEND' ? 'Frontend' : 'Server');
  const getKeyTypeIcon = (t: string) => (t === 'FRONTEND' ? Globe : Server);

  const formatDate = useCallback((d: string) =>
    d ? new Date(d).toLocaleDateString(toIntlLocale(loadLocale())) : t('apiKeys.never'), [t]);
  const formatDateTime = useCallback((d: string) => {
    if (!d) return t('apiKeys.never');
    return new Date(d).toLocaleString(toIntlLocale(loadLocale()), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [t]);
  const timeAgo = useCallback((d: string) => {
    if (!d) return t('apiKeys.neverUsed');
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('users.time.justNow');
    if (mins < 60) return t('users.time.minutesAgo', { n: String(mins) });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('users.time.hoursAgo', { n: String(hours) });
    const days = Math.floor(hours / 24);
    if (days < 30) return t('users.time.daysAgo', { n: String(days) });
    return formatDate(d);
  }, [t, formatDate]);

  let filtered = keys;
  if (typeFilter) filtered = filtered.filter((k) => k.keyType === typeFilter);
  if (envFilter !== null) filtered = filtered.filter((k) => k.environmentId === envFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((k) => k.name.toLowerCase().includes(q));
  }
  const visibleKeys = filtered.slice(0, displayLimit);
  const hasMoreKeys = displayLimit < filtered.length;
  const showMoreKeys = () => setDisplayLimit((prev) => Math.min(prev + 10, filtered.length));
  const showAllKeys = () => setDisplayLimit(filtered.length);

  const renderTypeFilterBtn = (type: string) => {
    const active = typeFilter === type;
    const Icon = type === 'FRONTEND' ? Globe : Server;
    const style =
      type === 'FRONTEND'
        ? {
            on: 'bg-warning/10 text-palette-warning-600 dark:text-palette-warning-700 border-warning/20',
            off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent',
          }
        : {
            on: 'bg-brand/10 text-brand border-brand/20',
            off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent',
          };
    return (
      <button
        onClick={() => setTypeFilter(active ? null : type)}
        className={`inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border ${active ? style.on : style.off}`}
      >
        <Icon size={12} />
        {getKeyTypeLabel(type)}
      </button>
    );
  };

  const renderEnvFilterBtn = (env: Environment) => {
    const active = envFilter === env.id;
    const styles = envColorStyles(getEnvColor(env));
    return (
      <button
        onClick={() => setEnvFilter(active ? null : env.id)}
        className={`inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border ${
          active ? '' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
        }`}
        style={active ? styles.soft : undefined}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={styles.dot} />
        {env.name}
      </button>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader title={t('apiKeys.title')} description={t('apiKeys.description')} />
        <div className="hidden sm:block">
          <GradientButton onClick={openCreate} icon={<Plus size={18} />}>
            {t('apiKeys.create')}
          </GradientButton>
        </div>
      </div>

      <TipCard
        text={t('apiKeys.tipText')}
        label={t('apiKeys.tipLabel')}
        icon={<BadgeCheck />}
        storageKey="apikeys"
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('apiKeys.searchPlaceholder')}
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setTypeFilter(null)}
            className={`inline-flex items-center px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border ${
              !typeFilter
                ? 'bg-brand/10 text-brand border-brand/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            {t('apiKeys.filterAllTypes')}
          </button>
          {renderTypeFilterBtn('SERVER')}
          {renderTypeFilterBtn('FRONTEND')}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setEnvFilter(null)}
            className={`inline-flex items-center px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border ${
              envFilter === null
                ? 'bg-brand/10 text-brand border-brand/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            {t('apiKeys.filterAllEnvironments')}
          </button>
          {environments.map((env) => renderEnvFilterBtn(env))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <ApiKeyTableSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            illustration={<EmptyKeysIllustration />}
            title={t('apiKeys.emptyTitle')}
            description={
              searchQuery || typeFilter || envFilter !== null
                ? t('apiKeys.emptyFiltered')
                : t('apiKeys.emptyDescription')
            }
            buttonLabel={
              !searchQuery && !typeFilter && envFilter === null ? t('apiKeys.create') : undefined
            }
            onAction={!searchQuery && !typeFilter && envFilter === null ? openCreate : undefined}
          />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {visibleKeys.map((k, idx) => {
                const expanded = expandedIds.has(k.id);
                const TypeIcon = getKeyTypeIcon(k.keyType);
                return (
                  <motion.div
                    key={k.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="group bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      className="flex gap-4 px-4 py-3 cursor-pointer"
                      onClick={() => toggleExpand(k.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpand(k.id);
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 ${getKeyTypeColor(k.keyType)}`}>
                          <TypeIcon size={16} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-semibold text-body-sm text-foreground truncate transition-all">
                            {k.name}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-caption font-medium"
                            style={envColorStyles(envColorHex(k.environmentId)).soft}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: envColorHex(k.environmentId) }}
                            />
                            {envName(k.environmentId)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {!expanded && (
                          <span className="text-caption text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {formatDate(k.createdAt)}
                          </span>
                        )}
                        {expanded ? (
                          <ChevronUp
                            size={16}
                            className="text-muted-foreground group-hover:text-brand transition-colors"
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="text-muted-foreground group-hover:text-brand transition-colors"
                          />
                        )}
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border">
                            <div className="p-4 pb-3">
                              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-caption font-semibold text-palette-warning-600 dark:text-palette-warning-700 uppercase tracking-wider">
                                    {t('apiKeys.secretKey')}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowKey(showKey === k.id ? null : k.id);
                                      }}
                                      className="flex items-center gap-1.5 px-2.5 py-1 text-caption font-medium rounded-xl text-palette-warning-600 dark:text-palette-warning-700 bg-warning/10 hover:bg-warning/10 transition-colors"
                                    >
                                      {showKey === k.id ? (
                                        <>
                                          <EyeOff size={12} />
                                          {t('apiKeys.hide')}
                                        </>
                                      ) : (
                                        <>
                                          <Eye size={12} />
                                          {t('apiKeys.show')}
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyKey(k.id, k.apiKey);
                                      }}
                                      disabled={copiedKeyId === k.id}
                                      className={`flex items-center gap-1 px-2.5 py-1 text-caption font-medium rounded-xl transition-colors ${
                                        copiedKeyId === k.id
                                          ? 'text-success dark:text-palette-success-700 bg-success/10 cursor-default'
                                          : 'text-palette-warning-600 dark:text-palette-warning-700 bg-warning/10 hover:bg-warning/10'
                                      }`}
                                    >
                                      {copiedKeyId === k.id ? (
                                        <Check size={12} className="text-success" />
                                      ) : (
                                        <Copy size={12} />
                                      )}
                                      {copiedKeyId === k.id
                                        ? t('apiKeys.copied')
                                        : t('apiKeys.copyKey')}
                                    </button>
                                  </div>
                                </div>
                                <div className="bg-input-background border border-warning/20 rounded-lg px-4 py-3">
                                  <span className="text-body-sm font-mono font-medium text-foreground/90 break-all select-all">
                                    {showKey === k.id
                                      ? k.apiKey
                                      : '••••••••••••••••••••••••••••••••••••••••••••••••••'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border-t border-border">
                              <div className="px-4 py-2.5">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('common.type')}
                                </span>
                                <span className="text-caption font-medium text-foreground/80 flex items-center gap-1.5">
                                  <TypeIcon
                                    size={11}
                                    className={
                                      k.keyType === 'FRONTEND' ? 'text-success' : 'text-brand'
                                    }
                                  />
                                  {getKeyTypeLabel(k.keyType)}
                                </span>
                              </div>
                              <div className="px-4 py-2.5">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('apiKeys.created')}
                                </span>
                                <span className="text-caption text-foreground/80 flex items-center gap-1.5">
                                  <Clock size={11} className="text-muted-foreground shrink-0" />
                                  {formatDateTime(k.createdAt)}
                                </span>
                              </div>
                              <div className="px-4 py-2.5">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('apiKeys.lastUsed')}
                                </span>
                                <span className="text-caption text-foreground/80">
                                  {timeAgo(k.lastUsedAt)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 border-t border-border">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(k.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:text-destructive hover:border-destructive/20 hover:bg-destructive/10 transition-all"
                              >
                                <Trash2 size={12} />
                                {t('common.delete')}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {hasMoreKeys && (
              <div className="flex items-center justify-center gap-3 pt-3 pb-1">
                <GradientButton variant="secondary" onClick={showMoreKeys}>
                  {t('users.list.showMore', { n: String(filtered.length - visibleKeys.length) })}
                </GradientButton>
                <GradientButton
                  variant="secondary"
                  onClick={showAllKeys}
                  className="bg-brand/10 border-brand/20 text-brand hover:bg-brand/20"
                >
                  {t('users.list.showAll', { n: String(filtered.length) })}
                </GradientButton>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-brand/10 border border-brand/20 dark:border-brand/20 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="bg-brand/10 dark:bg-brand/20 p-2 rounded-lg text-brand dark:text-brand shrink-0">
          <Shield size={20} />
        </div>
        <div>
          <h4 className="text-brand dark:text-foreground font-medium mb-1">
            {t('apiKeys.securityTitle')}
          </h4>
          <p className="text-body-sm text-brand dark:text-muted-foreground leading-relaxed">
            {t('apiKeys.securityDesc')}
          </p>
        </div>
      </div>

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={t('apiKeys.create')}
        description={t('apiKeys.panelDescription')}
        footer={
          <>
            <button
              onClick={() => setPanelOpen(false)}
              className="inline-flex items-center px-5 py-2.5 text-body-sm font-medium text-foreground/80 hover:bg-accent rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <GradientButton onClick={handleCreate} disabled={saving || !formName || !formEnvId} loading={saving}>
              {t('common.saveChanges')}
            </GradientButton>
          </>
        }
      >
        <div className="space-y-5">
          {error && <ErrorBox>{error}</ErrorBox>}

          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-caption text-palette-warning-600 dark:text-palette-warning-700">{t('apiKeys.panelWarning')}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-body-sm font-medium text-foreground/80 flex items-center justify-between">
              <span>{t('common.name')}</span>
              <span className="text-caption font-normal text-muted-foreground/50 tabular-nums">
                {formName.length}/120
              </span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => { setFormName(e.target.value); setFormNameError(''); }}
              maxLength={120}
              placeholder={t('apiKeys.formNamePlaceholder')}
              aria-invalid={!!formNameError || undefined}
              aria-describedby={formNameError ? 'apikey-name-error' : undefined}
              className={`w-full bg-input-background border rounded-lg px-4 py-2.5 text-body-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground ${formNameError ? 'border-destructive' : 'border-border'}`}
            />
            {formNameError && (
              <p id="apikey-name-error" role="alert" className="text-caption text-destructive">{formNameError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={`text-body-sm font-medium ${formEnvError ? 'text-destructive' : 'text-foreground/80'}`}>
              {t('apiKeys.formEnvLabel')}
            </label>
            <Select
              value={String(formEnvId ?? '')}
              onValueChange={(v) => { setFormEnvId(v ? Number(v) : null); setFormEnvError(''); }}
            >
              <SelectTrigger aria-invalid={!!formEnvError || undefined} aria-describedby={formEnvError ? 'apikey-env-error' : undefined} className={`w-full bg-input-background rounded-lg px-4 py-2.5 h-auto text-body-sm ${formEnvError ? 'border-destructive' : 'border-input'}`}>
                <SelectValue placeholder={t('apiKeys.formEnvPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {environments.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getEnvColor(e) }} />
                      {e.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formEnvError && (
              <p id="apikey-env-error" role="alert" className="text-caption text-destructive">{formEnvError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-body-sm font-medium text-foreground/80">
              {t('apiKeys.formKeyTypeLabel')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    value: 'SERVER',
                    icon: Server,
                    colorHex: '#2d9484',
                    borderColor: 'border-brand',
                    bgSelected: 'bg-brand/10',
                    textSelected: 'text-brand dark:text-brand',
                    label: 'Server',
                    description: t('apiKeys.formServerDesc'),
                  },
                  {
                    value: 'FRONTEND',
                    icon: Globe,
                    colorHex: '#c08140',
                    borderColor: 'border-warning',
                    bgSelected: 'bg-warning/10',
                    textSelected: 'text-palette-warning-600 dark:text-palette-warning-700',
                    label: 'Frontend',
                    description: t('apiKeys.formFrontendDesc'),
                  },
                ] as const
              ).map(
                ({
                  value,
                  icon: Icon,
                  colorHex,
                  borderColor,
                  bgSelected,
                  textSelected,
                  label,
                  description,
                }) => {
                  const selected = formKeyType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormKeyType(value)}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                        selected
                          ? `${borderColor} ${bgSelected} ${textSelected} shadow-sm`
                          : 'border-border text-muted-foreground hover:border-border'
                      }`}
                    >
                      <ColorIcon
                        variant="gradient"
                        size="md"
                        color={colorHex}
                        icon={<Icon size={16} />}
                        shadow
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-body-sm font-semibold ${selected ? textSelected : 'text-foreground/80'}`}
                        >
                          {label}
                        </div>
                        <div className="text-caption text-muted-foreground mt-0.5">{description}</div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('apiKeys.deleteConfirmTitle')}
        description={t('apiKeys.deleteConfirmDescription', {
          name: keys.find((k) => k.id === deleteId)?.name ?? '',
        })}
        confirmLabel={t('common.delete')}
        confirmPhrase={keys.find((k) => k.id === deleteId)?.name}
        onConfirm={handleDelete}
        loading={deleting}
      />
      <Fab onClick={openCreate} label={t('apiKeys.create')} />
    </div>
  );
}
