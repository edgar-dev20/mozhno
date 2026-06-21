import { useState } from 'react';
import {
  Monitor,
  Server,
  Globe,
  Clock,
  ChevronDown,
  ChevronUp,
  Activity,
  Rocket,
  ShieldOff,
  Search,
  Box,
} from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { api, ClientInstance, FlagResponse } from '@/api';
import { NavLink } from 'react-router';
import { JavaIcon, JavaScriptIcon } from '@/app/components/LanguageIcons';
import { SectionHeader, TruncatedCopyTooltip } from '@/shared';
import { TableSkeleton } from '@/app/components/skeletons';
import { useProjectQuery, useEnvironmentsQuery } from '@/app/hooks/queries';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useT } from '@/i18n';

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

const ACTIVE_MS = 5 * 60 * 1000;
const RECENT_MS = 60 * 60 * 1000;
const WINDOW_MS = 24 * 60 * 60 * 1000;

function getStaleness(lastSeenAt: string): 'active' | 'recent' | 'stale' {
  const age = Date.now() - new Date(lastSeenAt).getTime();
  if (age <= ACTIVE_MS) return 'active';
  if (age <= RECENT_MS) return 'recent';
  return 'stale';
}

export function ClientInstances() {
  const t = useT();
  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: environments = [] } = useEnvironmentsQuery();

  const [envFilter, setEnvFilter] = useState<number | null>(null);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [flagCache, setFlagCache] = useState<Record<number, FlagResponse[]>>({});
  const [flagsExpanded, setFlagsExpanded] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'java' | 'js'>('all');

  const timeAgo = useCallback((d: string) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('users.time.justNow');
    if (mins < 60) return t('users.time.minutesAgo', { n: String(mins) });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('users.time.hoursAgo', { n: String(hours) });
    const days = Math.floor(hours / 24);
    return t('users.time.daysAgo', { n: String(days) });
  }, [t]);

  const { data: instances = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.clientInstances.filtered(projectId, envFilter),
    queryFn: () => api.clientInstances.list(projectId ?? 0, envFilter ?? undefined),
    enabled: !!projectId,
    staleTime: 15_000,
  });

  const { data: metricsByFlag = new Map() } = useQuery({
    queryKey: queryKeys.metrics.project(projectId, envFilter),
    queryFn: async () => {
      if (!projectId) return new Map<number, number>();
      const data = await api.metrics.listForProject(envFilter ?? undefined);
      const map = new Map<number, number>();
      for (const m of data) {
        const total = m.evaluationTrueCount + m.evaluationFalseCount;
        map.set(m.flagId, (map.get(m.flagId) || 0) + total);
      }
      return map;
    },
    enabled: !!projectId,
    staleTime: 15_000,
  });

  const loadFlags = async (envId: number) => {
    const cached = flagCache[envId];
    if ((cached !== undefined && Array.isArray(cached)) || !projectId) return;
    try {
      const flags = await api.flags.listByEnvironment(envId);
      setFlagCache((prev) => ({ ...prev, [envId]: flags }));
    } catch {
      /* silently ignore flag loading errors */
    }
  };

  const handleEnvFilter = (envId: number | null) => {
    setEnvFilter(envId);
    setExpandedApps(new Set());
    setFlagCache({});
  };

  const toggleExpand = (appName: string, envIds: number[]) => {
    const next = new Set(expandedApps);
    if (next.has(appName)) {
      next.delete(appName);
    } else {
      next.add(appName);
      envIds.forEach((envId) => loadFlags(envId));
    }
    setExpandedApps(next);
  };

  const envName = (id: number) => environments.find((e) => e.id === id)?.name ?? '-';
  const envGradient = (id: number) => {
    const name = envName(id);
    if (name === 'Production')
      return {
        from: '#2d9484',
        to: '#3db8a5',
        bg: 'from-brand/10 to-brand/5',
        bgFlat: 'bg-success/10 text-success border-success/20',
        border: 'border-success/20',
        dot: 'bg-success',
        text: 'text-success',
      };
    if (name === 'Development')
      return {
        from: '#c08140',
        to: '#d4995a',
        bg: 'from-warning/10 to-warning/5',
        bgFlat: 'bg-warning/10 text-warning border-warning/20',
        border: 'border-warning/20',
        dot: 'bg-warning',
        text: 'text-warning',
      };
    if (name === 'staging')
      return {
        from: '#b86840', to: '#c87850',
        bg: 'from-chart-4/10 to-chart-4/5',
        bgFlat: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
        border: 'border-chart-4/20',
        dot: 'bg-chart-4',
        text: 'text-chart-4',
      };
    return {
      from: '#5a82a0',
      to: '#6e94b4',
      bg: 'from-info/10 to-info/5',
      bgFlat: 'bg-info/10 text-info border-info/20',
      border: 'border-info/20',
      dot: 'bg-info',
      text: 'text-info',
    };
  };

  const envCardStyle = (envId: number | null) => {
    const name = envName(envId);
    if (name === 'Production') return 'bg-success/10 border border-success/20';
    if (name === 'Development') return 'bg-warning/10 border border-warning/20';
    if (name === 'Staging') return 'bg-brand/10 border border-brand/20';
    return 'bg-info/10 border border-info/20';
  };

  const getAppIcon = (appType: string, size = 14) => {
    if (appType === 'java') return <JavaIcon size={size} />;
    if (appType === 'js') return <JavaScriptIcon size={size} />;
    return <Monitor size={size} className="text-brand" />;
  };

  // eslint-disable-next-line react-hooks/purity
  const cutoff = useMemo(() => Date.now() - WINDOW_MS, []);
  const recentInstances = instances.filter((inst) => new Date(inst.lastSeenAt).getTime() > cutoff);

  const filtered = recentInstances.filter((inst) => {
    if (langFilter !== 'all' && inst.appType !== langFilter) return false;
    if (searchQuery && !inst.appName.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  const grouped = new Map<string, ClientInstance[]>();
  for (const inst of filtered) {
    const key = inst.appName;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(inst);
  }

  const groups = Array.from(grouped.entries()).map(([appName, instances]) => ({
    appName,
    instances,
    appType: instances[0]?.appType ?? 'unknown',
    keyTypes: [...new Set(instances.map((i) => i.keyType))],
    lastSeenAt: instances.reduce(
      (latest, i) => (!latest || (i.lastSeenAt && i.lastSeenAt > latest) ? i.lastSeenAt : latest),
      '',
    ),
    environmentIds: [...new Set(instances.map((i) => i.environmentId))],
  }));

  const appLabel =
    groups.length === 1
      ? t('clientInstances.appOne')
      : groups.length < 5
        ? t('clientInstances.appFew')
        : t('clientInstances.appMany');

  const instanceLabel =
    recentInstances.length === 1
      ? t('clientInstances.instanceOne')
      : recentInstances.length < 5
        ? t('clientInstances.instanceFew')
        : t('clientInstances.instanceMany');

  const sectionDescription =
    recentInstances.length > 0
      ? `${groups.length} ${appLabel}, ${filtered.length} ${instanceLabel}`
      : t('clientInstances.descriptionEmpty');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader title={t('clientInstances.title')} description={sectionDescription} />
        <div className="hidden sm:block">{/* spacer */}</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder={t('clientInstances.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring text-foreground/80 placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setLangFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                langFilter === 'all'
                  ? 'bg-brand/10 text-brand border border-brand/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80 border border-transparent'
              }`}
            >
              {t('common.all')}
            </button>
            <button
              onClick={() => setLangFilter('java')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                langFilter === 'java'
                  ? 'bg-warning/10 text-warning border-warning/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
              }`}
            >
              <JavaIcon size={12} />
              Java
            </button>
            <button
              onClick={() => setLangFilter('js')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                langFilter === 'js'
                  ? 'bg-warning/10 text-warning border-warning/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
              }`}
            >
              <JavaScriptIcon size={12} />
              JS
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {environments.map((e) => {
            const g = envGradient(e.id);
            return (
              <button
                key={e.id}
                onClick={() => handleEnvFilter(e.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                  envFilter === e.id
                    ? g.bgFlat
                    : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
                }`}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${g.dot}`}></span>
                {e.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : recentInstances.length === 0 ? (
          <div className="bg-card rounded-xl px-6 py-16 text-center shadow-md">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-info/10 dark:from-primary/15 dark:to-info/15 flex items-center justify-center">
                <Activity size={24} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/80">
                  {t('clientInstances.emptyTitle')}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  {t('clientInstances.emptyDescription')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {groups.map((group, idx) => {
              const expanded = expandedApps.has(group.appName);
              const {
                appName,
                instances: groupInstances,
                appType,
                keyTypes,
                lastSeenAt,
                environmentIds,
              } = group;
              const instanceCount = groupInstances.length;
              const activeCount = groupInstances.filter(
                (inst) => getStaleness(inst.lastSeenAt) === 'active',
              ).length;

              return (
                <motion.div
                  key={appName}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div
                    className="flex gap-4 px-4 py-3 cursor-pointer"
                    onClick={() => toggleExpand(appName, environmentIds)}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="p-1.5 rounded-lg shrink-0 bg-muted">
                        {getAppIcon(appType, 16)}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate transition-all">
                          {appName}
                        </span>
                        {keyTypes.map((kt) => (
                          <span
                            key={kt}
                            className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${
                              kt === 'FRONTEND'
                                ? 'text-warning bg-warning/10 border-warning/20'
                                : 'text-brand bg-brand/10 border-brand/20'
                            }`}
                          >
                            {kt === 'FRONTEND' ? <Globe size={10} /> : <Server size={10} />}
                            {kt === 'FRONTEND' ? 'Frontend' : 'Server'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!expanded && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {environmentIds.slice(0, 3).map((envId) => {
                              const eg = envGradient(envId);
                              return (
                                <span
                                  key={envId}
                                  className={`w-1.5 h-1.5 rounded-full ${eg.dot}`}
                                />
                              );
                            })}
                            {environmentIds.length > 3 && (
                              <span className="text-xs font-semibold text-muted-foreground">
                                +{environmentIds.length - 3}
                              </span>
                            )}
                          </div>
                          {activeCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary/80 px-2 py-0.5 rounded-lg border border-primary/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              {activeCount} / {instanceCount}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-accent px-2 py-0.5 rounded-lg">
                              <Box size={11} />
                              {instanceCount}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} />
                            {timeAgo(lastSeenAt)}
                          </span>
                        </div>
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
                        <div className="border-t border-border px-4 py-2.5">
                          <div className="mb-2.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                {t('clientInstances.instances')}
                              </span>
                              <span className="text-xs text-muted-foreground">{instanceCount}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {groupInstances.map((inst) => {
                                const staleness = getStaleness(inst.lastSeenAt);
                                return (
                                  <div
                                    key={inst.id}
                                    className={`rounded-lg px-3 py-2.5 flex flex-col gap-1.5 ${staleness === 'stale' ? 'bg-secondary/60 border border-border/40' : envCardStyle(inst.environmentId)}`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <TruncatedCopyTooltip
                                        value={inst.instanceId}
                                        className={`font-mono text-xs min-w-0 ${staleness === 'stale' ? 'text-foreground/50' : 'text-foreground/80'}`}
                                      />
                                      {staleness === 'active' && (
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock size={10} />
                                        {timeAgo(inst.lastSeenAt)}
                                      </span>
                                      {inst.sdkVersion && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                          v{inst.sdkVersion}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {environmentIds.map((envId) => {
                            const eg = envGradient(envId);
                            const rawFlags = flagCache[envId];
                            const flags = Array.isArray(rawFlags) ? rawFlags : undefined;
                            return (
                              <div key={envId} className="border-t border-border pt-2.5 mt-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${eg.dot}`}></span>
                                  <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    {t('clientInstances.flags')}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {envName(envId)}
                                  </span>
                                  {flags && (
                                    <span className="text-xs text-muted-foreground">
                                      {flags.filter((f) => !f.archived).length}
                                    </span>
                                  )}
                                </div>
                                {!flags ? (
                                  <div className="flex items-center justify-center py-4">
                                    <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />
                                  </div>
                                ) : flags.filter((f) => !f.archived).length === 0 ? (
                                  <p className="text-xs text-muted-foreground py-2">
                                    {t('clientInstances.noFlagsInEnv')}
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                                    {(() => {
                                      const visible = flags.filter((f) => !f.archived);
                                      const max = 10;
                                      const showAll = flagsExpanded.has(`${appName}:${envId}`);
                                      const displayed = showAll ? visible : visible.slice(0, max);
                                      return (
                                        <>
                                          {displayed.map((flag) => {
                                            const metricTotal = metricsByFlag.get(flag.id) ?? 0;
                                            const TypeIcon =
                                              flag.flagType === 'KILLSWITCH' ? ShieldOff : Rocket;
                                            const typeColor =
                                              flag.flagType === 'KILLSWITCH'
                                                ? 'text-chart-4'
                                                : 'text-info';
                                            return (
                                              <NavLink
                                                key={flag.id}
                                                to={`/flags?open=${encodeURIComponent(flag.key)}`}
                                                className="bg-secondary rounded-lg px-2.5 py-2 hover:shadow-md transition-all group/flag flex flex-col gap-1"
                                              >
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                  <span
                                                    className={`shrink-0 w-1.5 h-1.5 rounded-full ${flag.enabled ? 'bg-primary shadow-sm shadow-black/10 dark:shadow-black/20' : 'bg-muted-foreground/30'}`}
                                                  />
                                                  <span className="text-xs font-semibold text-foreground/90 truncate">
                                                    {flag.name}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                                  <TypeIcon
                                                    size={11}
                                                    className={`shrink-0 ${typeColor}`}
                                                  />
                                                  {flag.percentage != null &&
                                                    flag.percentage < 100 && (
                                                      <span className="shrink-0 text-xs text-brand font-medium">
                                                        {flag.percentage}%
                                                      </span>
                                                    )}
                                                  <code className="text-xs font-mono text-muted-foreground/70 truncate">
                                                    {flag.key}
                                                  </code>
                                                  {flag.tags.length > 0 && (
                                                    <div className="flex items-center gap-1 shrink-0">
                                                      {flag.tags.slice(0, 2).map((tv, i) => (
                                                        <span
                                                          key={i}
                                                          className="inline-flex items-center px-1 py-0 rounded text-xs font-medium text-white truncate max-w-[64px] dark:brightness-[.85] dark:saturate-[.7]"
                                                          style={{ background: tv.tagColor }}
                                                        >
                                                          {tv.value}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                                {metricTotal > 0 && (
                                                  <div className="flex items-center gap-1">
                                                    <Activity
                                                      size={9}
                                                      className="text-muted-foreground"
                                                    />
                                                    <span className="text-xs text-muted-foreground/70">
                                                      {formatCount(metricTotal)}
                                                    </span>
                                                  </div>
                                                )}
                                              </NavLink>
                                            );
                                          })}
                                          {visible.length > max && !showAll && (
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setFlagsExpanded(
                                                  (prev) =>
                                                    new Set([...prev, `${appName}:${envId}`]),
                                                );
                                              }}
                                              className="bg-secondary border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-2 hover:border-brand dark:hover:border-brand hover:bg-brand/30 dark:hover:bg-brand/5 transition-all flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-brand dark:hover:text-brand cursor-pointer"
                                            >
                                              <span className="text-xs font-medium">
                                                +{visible.length - max}
                                              </span>
                                              <span className="text-xs">{t('common.showAll')}</span>
                                            </button>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
