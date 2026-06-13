import { useState, useEffect } from 'react';
import { useT } from '@/i18n';
import { Key, Copy, Eye, EyeOff, Shield, Server, Globe, Plus, Trash2, BadgeCheck, Monitor, ExternalLink, ChevronDown, ChevronUp, Clock } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { api, Environment } from "@/api";
import { TipCard } from "@/app/components/TipCard";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { SidePanel } from "@/app/components/SidePanel";
import { SdkInfo } from "@/app/components/SdkInfo";
import { SectionHeader, GradientButton, EmptyState, LoadingState, SearchInput } from "@/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { NavLink } from 'react-router';
import { useProjectQuery, useEnvironmentsQuery } from '@/app/hooks/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function ApiKeys() {
  const queryClient = useQueryClient();

  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: environments = [] } = useEnvironmentsQuery();

  const { data: keys = [], isLoading: loading } = useQuery({
    queryKey: ['apikeys', projectId],
    queryFn: () => api.apiKeys.list(),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const { data: instances = [] } = useQuery({
    queryKey: ['clientInstances', projectId],
    queryFn: () => api.clientInstances.list(projectId ?? 0),
    enabled: !!projectId,
    staleTime: 30_000,
    retry: 0,
  });

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showKey, setShowKey] = useState<number | null>(null);
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
  const [formKeyType, setFormKeyType] = useState('SERVER');

  useEffect(() => {
    if (environments.length > 0 && !formEnvId) setFormEnvId(environments[0].id);
  }, [environments, formEnvId]);

  useEffect(() => { setDisplayLimit(10); }, [searchQuery, typeFilter, envFilter]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.apiKeys.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apikeys', projectId] });
      setExpandedIds(prev => { const next = new Set(prev); next.delete(deleteId!); return next; });
      setDeleteId(null);
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : t('apiKeys.errors.delete'));
    },
    onSettled: () => setDeleting(false),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.apiKeys.create({ name: formName, environmentId: formEnvId ?? undefined, keyType: formKeyType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apikeys', projectId] });
      setPanelOpen(false);
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : t('apiKeys.errors.create'));
    },
    onSettled: () => setSaving(false),
  });

  const t = useT();

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setError('');
    setFormName('');
    setFormEnvId(environments[0]?.id ?? null);
    setFormKeyType('SERVER');
    setPanelOpen(true);
  };

  const handleCreate = () => {
    if (!projectId || !formName) return;
    setSaving(true);
    createMutation.mutate();
  };

  const handleDelete = () => {
    if (!projectId || !deleteId) return;
    setDeleting(true);
    deleteMutation.mutate(deleteId);
  };

  const copyKey = (key: string) => { navigator.clipboard.writeText(key); };

  const envName = (id: number | null) => environments.find(e => e.id === id)?.name ?? '—';
  const envColor = (id: number | null) => {
    const name = envName(id);
    if (name === 'Production') return 'bg-emerald-500';
    if (name === 'Development') return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  const envBadgeStyle = (id: number | null) => {
    const name = envName(id);
    if (name === 'Production') return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
    if (name === 'Development') return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20';
    return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
  };
  const envFilterActive = (id: number | null) => {
    const name = envName(id);
    if (name === 'Production') return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
    if (name === 'Development') return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
    return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
  };
  const getKeyTypeBadge = (t: string) => {
    if (t === 'FRONTEND') return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
    return 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20';
  };
  const getKeyTypeLabel = (t: string) => t === 'FRONTEND' ? 'Frontend' : 'Server';
  const getKeyTypeIcon = (t: string) => t === 'FRONTEND' ? Globe : Server;

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ru-RU') : t('apiKeys.never');
  const formatDateTime = (d: string) => {
    if (!d) return t('apiKeys.never');
    return new Date(d).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const timeAgo = (d: string) => {
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
  };

  let filtered = keys;
  if (typeFilter) filtered = filtered.filter(k => k.keyType === typeFilter);
  if (envFilter !== null) filtered = filtered.filter(k => k.environmentId === envFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(k => k.name.toLowerCase().includes(q));
  }
  const visibleKeys = filtered.slice(0, displayLimit);
  const hasMoreKeys = displayLimit < filtered.length;
  const showMoreKeys = () => setDisplayLimit(prev => Math.min(prev + 10, filtered.length));
  const showAllKeys = () => setDisplayLimit(filtered.length);

  const renderTypeFilterBtn = (type: string) => {
    const active = typeFilter === type;
    const Icon = type === 'FRONTEND' ? Globe : Server;
    const style = type === 'FRONTEND'
      ? { on: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20', off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent' }
      : { on: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20', off: 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent' };
    return (
      <button
        onClick={() => setTypeFilter(active ? null : type)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${active ? style.on : style.off}`}
      >
        <Icon size={12} />
        {getKeyTypeLabel(type)}
      </button>
    );
  };

  const renderEnvFilterBtn = (env: Environment) => {
    const active = envFilter === env.id;
    return (
      <button
        onClick={() => setEnvFilter(active ? null : env.id)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
          active
            ? envFilterActive(env.id)
            : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${envColor(env.id)}`} />
        {env.name}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader
          title={t('apiKeys.title')}
          description={t('apiKeys.description')}

        />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>{t('apiKeys.create')}</GradientButton>
      </div>

      <TipCard
        text={t('apiKeys.tipText')}
        label={t('apiKeys.tipLabel')}
        icon={<BadgeCheck />}
        storageKey="apikeys"
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder={t('apiKeys.searchPlaceholder')} />
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setTypeFilter(null)}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              !typeFilter
                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20'
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
            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              envFilter === null
                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            {t('apiKeys.filterAllEnvironments')}
          </button>
          {environments.map(env => renderEnvFilterBtn(env))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <LoadingState text={t('apiKeys.loading')} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Key size={24} className="text-violet-500 dark:text-violet-400" />}
            title={t('apiKeys.emptyTitle')}
            description={searchQuery || typeFilter || envFilter !== null ? t('apiKeys.emptyFiltered') : t('apiKeys.emptyDescription')}
            buttonLabel={!searchQuery && !typeFilter && envFilter === null ? t('apiKeys.create') : undefined}
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
                  transition={{ duration: 0.2, delay: idx * 0.025 }}
                  className="group bg-card border border-border rounded-xl shadow-sm hover:border-border hover:shadow-md transition-all overflow-hidden"
                >
                  <div
                    className="flex gap-4 px-4 py-3 cursor-pointer"
                    onClick={() => toggleExpand(k.id)}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center shadow-sm shrink-0">
                          <Key size={14} className="text-white" />
                        </div>
                        <span className="font-semibold text-sm text-foreground truncate group-hover:bg-gradient-to-r group-hover:from-gradient-start group-hover:to-gradient-end group-hover:bg-clip-text group-hover:text-transparent transition-all">
                          {k.name}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${envBadgeStyle(k.environmentId)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${envColor(k.environmentId)}`} />
                          {envName(k.environmentId)}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${getKeyTypeBadge(k.keyType)}`}>
                          <TypeIcon size={10} />
                          {getKeyTypeLabel(k.keyType)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!expanded && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock size={10} />
                          {formatDate(k.createdAt)}
                        </span>
                      )}
                      {expanded ? (
                        <ChevronUp size={16} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
                      ) : (
                        <ChevronDown size={16} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
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
                            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{t('apiKeys.secretKey')}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShowKey(showKey === k.id ? null : k.id); }}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-xl text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 transition-colors"
                                  >
                                    {showKey === k.id ? <><EyeOff size={12} />{t('apiKeys.hide')}</> : <><Eye size={12} />{t('apiKeys.show')}</>}
                                  </button>
                                  <GradientButton
                                    onClick={(e) => { e.stopPropagation(); copyKey(k.apiKey); }}
                                    size="sm"
                                    icon={<Copy size={12} />}
>
                                    {t('apiKeys.copyKey')}
                                  </GradientButton>
                                </div>
                              </div>
                              <div className="bg-white dark:bg-neutral-950 border border-amber-200/60 dark:border-amber-500/10 rounded-lg px-4 py-3">
                                <span className="text-sm font-mono font-medium text-foreground/90 break-all select-all">
                                  {showKey === k.id ? k.apiKey : '••••••••••••••••••••••••••••••••••••••••••••••••••'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                            <div className="px-4 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('common.type')}</span>
                              <span className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                                <TypeIcon size={11} className={k.keyType === 'FRONTEND' ? 'text-emerald-500' : 'text-indigo-500'} />
                                {getKeyTypeLabel(k.keyType)}
                              </span>
                            </div>
                            <div className="px-4 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('apiKeys.created')}</span>
                              <span className="text-xs text-foreground/80 flex items-center gap-1.5">
                                <Clock size={11} className="text-muted-foreground shrink-0" />
                                {formatDateTime(k.createdAt)}
                              </span>
                            </div>
                            <div className="px-4 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('apiKeys.lastUsed')}</span>
                              <span className="text-xs text-foreground/80">
                                {timeAgo(k.lastUsedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 border-t border-border">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteId(k.id); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
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
              <GradientButton variant="secondary" onClick={showMoreKeys}>{t('users.list.showMore', { n: String(filtered.length - visibleKeys.length) })}</GradientButton>
              <GradientButton variant="secondary" onClick={showAllKeys} className="bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20">{t('users.list.showAll', { n: String(filtered.length) })}</GradientButton>
            </div>
          )}
          </>
        )}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0"><Shield size={20} /></div>
        <div><h4 className="text-indigo-900 dark:text-white font-medium mb-1">{t('apiKeys.securityTitle')}</h4><p className="text-sm text-indigo-700 dark:text-muted-foreground max-w-3xl">{t('apiKeys.securityDesc')}</p></div>
      </div>

      <SdkInfo />

      {instances.length > 0 && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-500/5 dark:to-blue-500/5 border border-cyan-100 dark:border-cyan-500/15 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
              <Monitor size={18} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground/90">
                {instances.length} {instances.length === 1 ? t('apiKeys.instancesOne') : instances.length < 5 ? t('apiKeys.instancesFew') : t('apiKeys.instancesMany')}
              </p>
              <p className="text-xs text-muted-foreground">
                {instances.slice(0, 3).map(i => i.appName).join(', ')}
                {instances.length > 3 && ' ' + t('apiKeys.andMoreInstances', { count: String(instances.length - 3) })}
              </p>
            </div>
          </div>
          <NavLink
            to="/applications"
            className="flex items-center gap-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
          >
            {t('apiKeys.allConnections')}
            <ExternalLink size={14} />
          </NavLink>
        </div>
      )}

      <SidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={t('apiKeys.create')}
        description={t('apiKeys.panelDescription')}
        footer={
          <>
            <button onClick={() => setPanelOpen(false)} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent rounded-xl transition-colors">{t('common.cancel')}</button>
            <GradientButton onClick={handleCreate} disabled={saving || !formName} loading={saving}>{t('common.saveChanges')}</GradientButton>
          </>
        }
      >
        <div className="space-y-5">
          {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>}

          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {t('apiKeys.panelWarning')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">{t('common.name')}</label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              maxLength={120}
              placeholder={t('apiKeys.formNamePlaceholder')}
              className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">{t('apiKeys.formEnvLabel')}</label>
            <Select value={String(formEnvId ?? '')} onValueChange={(v) => setFormEnvId(v ? Number(v) : null)}>
              <SelectTrigger className="w-full bg-input-background border-input rounded-xl px-4 py-2.5 h-auto text-sm">
                <SelectValue placeholder={t('apiKeys.formEnvPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {environments.map(e => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${envColor(e.id)}`} />
                      {e.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">{t('apiKeys.formKeyTypeLabel')}</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'SERVER', icon: Server, color: 'from-gradient-start to-gradient-end', borderColor: 'border-indigo-500', bgSelected: 'bg-indigo-50 dark:bg-indigo-500/10', textSelected: 'text-indigo-700 dark:text-indigo-300', label: 'Server', description: t('apiKeys.formServerDesc') },
                { value: 'FRONTEND', icon: Globe, color: 'from-emerald-600 to-emerald-500', borderColor: 'border-emerald-500', bgSelected: 'bg-emerald-50 dark:bg-emerald-500/10', textSelected: 'text-emerald-700 dark:text-emerald-300', label: 'Frontend', description: t('apiKeys.formFrontendDesc') },
              ] as const).map(({ value, icon: Icon, color, borderColor, bgSelected, textSelected, label, description }) => {
                const selected = formKeyType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormKeyType(value)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      selected
                        ? `${borderColor} ${bgSelected} ${textSelected} shadow-sm`
                        : 'border-border text-muted-foreground hover:border-border'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${selected ? textSelected : 'text-foreground/80'}`}>{label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title={t('apiKeys.deleteConfirmTitle')}
        description={t('apiKeys.deleteConfirmDescription', { name: keys.find(k => k.id === deleteId)?.name ?? '' })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
