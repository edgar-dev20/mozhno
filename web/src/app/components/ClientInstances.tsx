import { useState } from 'react';
import { Monitor, Server, Globe, Clock, ChevronDown, ChevronUp, Activity, Rocket, ShieldOff, Search } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { api, ClientInstance, FlagResponse } from "@/api";
import { NavLink } from 'react-router';
import { JavaIcon, JavaScriptIcon } from "@/app/components/LanguageIcons";
import { SectionHeader, LoadingState } from "@/shared";
import { useProjectQuery, useEnvironmentsQuery } from '@/app/hooks/queries';
import { useQuery } from '@tanstack/react-query';
import { useT } from '@/i18n';

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export function ClientInstances() {
  const t = useT();
  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: environments = [] } = useEnvironmentsQuery();

  const [envFilter, setEnvFilter] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [flagCache, setFlagCache] = useState<Record<number, FlagResponse[]>>({});
  const [flagsExpanded, setFlagsExpanded] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'java' | 'js'>('all');

  const timeAgo = (d: string) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('users.time.justNow');
    if (mins < 60) return t('users.time.minutesAgo', { n: String(mins) });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('users.time.hoursAgo', { n: String(hours) });
    const days = Math.floor(hours / 24);
    return t('users.time.daysAgo', { n: String(days) });
  };

  const { data: instances = [], isLoading: loading } = useQuery({
    queryKey: ['clientInstances', projectId, envFilter],
    queryFn: () => api.clientInstances.list(projectId ?? 0, envFilter ?? undefined),
    enabled: !!projectId,
    staleTime: 15_000,
  });

  const { data: metricsByFlag = new Map() } = useQuery({
    queryKey: ['metrics', 'project', projectId, envFilter],
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

  const loadFlags = async (instId: number, envId: number) => {
    if (flagCache[instId] || !projectId) return;
    try {
      const flags = await api.flags.list(envId);
      setFlagCache(prev => ({ ...prev, [instId]: flags }));
    } catch (e) { console.error(e); }
  };

  const handleEnvFilter = (envId: number | null) => {
    setEnvFilter(envId);
    setExpandedIds(new Set());
    setFlagCache({});
  };

  const toggleExpand = (inst: ClientInstance) => {
    const next = new Set(expandedIds);
    if (next.has(inst.id)) {
      next.delete(inst.id);
    } else {
      next.add(inst.id);
      loadFlags(inst.id, inst.environmentId);
    }
    setExpandedIds(next);
  };

  const envName = (id: number) => environments.find(e => e.id === id)?.name ?? '-';
  const envGradient = (id: number) => {
    const name = envName(id);
    if (name === 'Production') return { from: '#059669', to: '#10b981', bg: 'from-emerald-500/10 to-emerald-600/5', bgFlat: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20', border: 'border-emerald-500/20', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
    if (name === 'Development') return { from: '#d97706', to: '#f59e0b', bg: 'from-amber-500/10 to-amber-600/5', bgFlat: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20', border: 'border-amber-500/20', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
    if (name === 'staging') return { from: '#7c3aed', to: '#8b5cf6', bg: 'from-violet-500/10 to-violet-600/5', bgFlat: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20', border: 'border-violet-500/20', dot: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' };
    return { from: '#2563eb', to: '#3b82f6', bg: 'from-blue-500/10 to-blue-600/5', bgFlat: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20', border: 'border-blue-500/20', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' };
  };

  const getAppIcon = (appType: string) => {
    if (appType === 'java') return <JavaIcon size={14} />;
    if (appType === 'js') return <JavaScriptIcon size={14} />;
    return <Monitor size={14} className="text-cyan-500" />;
  };

  const getAppLabel = (appType: string) => {
    if (appType === 'java') return 'Java SDK';
    if (appType === 'js') return 'JS SDK';
    return appType;
  };

  const filtered = instances.filter(inst => {
    if (langFilter !== 'all' && inst.appType !== langFilter) return false;
    if (searchQuery && !inst.appName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const grouped = new Map<string, ClientInstance[]>();
  for (const inst of filtered) {
    const key = inst.appName;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(inst);
  }

  const appLabel = grouped.size === 1
    ? t('clientInstances.appOne')
    : grouped.size < 5
      ? t('clientInstances.appFew')
      : t('clientInstances.appMany');

  const sectionDescription = instances.length > 0
    ? `${filtered.length} ${t('common.fromLower')} ${instances.length} — ${grouped.size} ${appLabel}`
    : t('clientInstances.descriptionEmpty');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader
          title={t('clientInstances.title')}
          description={sectionDescription}
        />
        <div className="hidden sm:block">{/* spacer */}</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('clientInstances.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring text-foreground/80 placeholder:text-muted-foreground"
            />
          </div>
      <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setLangFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                langFilter === 'all'
                  ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80 border border-transparent'
              }`}
            >
              {t('common.all')}
            </button>
            <button
              onClick={() => setLangFilter('java')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
                langFilter === 'java'
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
              }`}
            >
              <JavaIcon size={12} />
              Java
            </button>
            <button
              onClick={() => setLangFilter('js')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
                langFilter === 'js'
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
              }`}
           >
            <JavaScriptIcon size={12} />
            JS
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {environments.map(e => {
          const g = envGradient(e.id);
          return (
            <button
              key={e.id}
              onClick={() => handleEnvFilter(e.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
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
          <LoadingState text={t('clientInstances.loading')} />
        ) : instances.length === 0 ? (
          <div className="bg-card border border-border rounded-xl px-6 py-16 text-center shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/10 dark:to-purple-500/10 flex items-center justify-center">
                <Activity size={24} className="text-violet-500 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/80">{t('clientInstances.emptyTitle')}</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{t('clientInstances.emptyDescription')}</p>
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((inst, idx) => {
              const expanded = expandedIds.has(inst.id);
              const eg = envGradient(inst.environmentId);
              const flags = flagCache[inst.id];
              return (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group bg-card border border-border rounded-xl shadow-sm hover:border-border hover:shadow-md transition-all overflow-hidden"
                >
                  <div
                    className="flex gap-4 px-4 py-3 cursor-pointer"
                    onClick={() => toggleExpand(inst)}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate group-hover:bg-gradient-to-r group-hover:from-gradient-start group-hover:to-gradient-end group-hover:bg-clip-text group-hover:text-transparent transition-all">
                          {inst.appName}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${
                          inst.keyType === 'FRONTEND'
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
                            : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20'
                        }`}>
                          {inst.keyType === 'FRONTEND' ? <Globe size={10} /> : <Server size={10} />}
                          {inst.keyType === 'FRONTEND' ? 'Frontend' : 'Server'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 shrink-0 leading-none">
                          {getAppIcon(inst.appType)}
                          {getAppLabel(inst.appType)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!expanded && (
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 text-xs font-medium ${eg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${eg.dot}`}></span>
                            {envName(inst.environmentId)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} />
                            {timeAgo(inst.lastSeenAt)}
                          </span>
                        </div>
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
                        <div className="border-t border-border px-4 py-2.5">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{t('clientInstances.instance')}</span>
                              <code className="text-xs font-mono text-foreground/80 bg-accent px-2 py-0.5 rounded block truncate">
                                {inst.instanceId}
                              </code>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{t('clientInstances.environment')}</span>
                              <span className={`text-xs font-medium flex items-center gap-1 ${eg.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${eg.dot}`}></span>
                                {envName(inst.environmentId)}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{t('clientInstances.firstSeen')}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock size={11} />
                                {formatDate(inst.firstSeenAt)}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{t('clientInstances.activity')}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Activity size={11} />
                                {formatDate(inst.lastSeenAt)}
                              </span>
                            </div>
                            {inst.sdkVersion && (
                              <div className="space-y-0.5">
                                <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{t('clientInstances.sdkVersion')}</span>
                                <span className="text-xs text-muted-foreground">v{inst.sdkVersion}</span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-border mt-2 pt-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                {t('clientInstances.flags')}
                              </span>
                              {flags && (
                                <span className="text-xs text-muted-foreground">{flags.length}</span>
                              )}
                            </div>
                            {!flags ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="w-4 h-4 border-2 border-border border-t-violet-500 rounded-full animate-spin" />
                              </div>
                            ) : flags.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2">{t('clientInstances.noFlagsInEnv')}</p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                                {(() => {
                                  const visible = flags.filter(f => !f.archived);
                                  const max = 10;
                                  const showAll = flagsExpanded.has(inst.id);
                                  const displayed = showAll ? visible : visible.slice(0, max);
                                  return (
                                    <>
                                    {displayed.map(flag => {
                                      const metricTotal = metricsByFlag.get(flag.id) ?? 0;
                                      const TypeIcon = flag.flagType === 'KILLSWITCH' ? ShieldOff : Rocket;
                                      const typeColor = flag.flagType === 'KILLSWITCH'
                                        ? 'text-red-500'
                                        : 'text-sky-500';
                                      return (
                                        <NavLink
                                          key={flag.id}
                                          to={`/flags?open=${encodeURIComponent(flag.key)}`}
                                          className="bg-secondary border border-border rounded-lg px-2.5 py-2 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-sm transition-all group/flag flex flex-col gap-1"
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${flag.enabled ? 'bg-emerald-500 shadow-sm shadow-black/10 dark:shadow-black/20' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                                            <span className="text-xs font-semibold text-foreground/90 truncate">{flag.name}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                            <TypeIcon size={11} className={`shrink-0 ${typeColor}`} />
                                            {flag.percentage != null && flag.percentage < 100 && (
                                              <span className="shrink-0 text-[9px] text-violet-500 dark:text-violet-400 font-medium">{flag.percentage}%</span>
                                            )}
                                            <code className="text-xs font-mono text-muted-foreground/70 truncate">{flag.key}</code>
                                            {flag.tags.length > 0 && (
                                              <div className="flex items-center gap-1 shrink-0">
                                                {flag.tags.slice(0, 2).map((tv, i) => (
                                                  <span key={i} className="inline-flex items-center px-1 py-0 rounded text-[8px] font-medium text-white truncate max-w-[56px]" style={{ background: tv.tagColor }}>{tv.value}</span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                          {metricTotal > 0 && (
                                            <div className="flex items-center gap-1">
                                              <Activity size={9} className="text-muted-foreground" />
                                              <span className="text-[9px] text-muted-foreground/70">{formatCount(metricTotal)}</span>
                                            </div>
                                          )}
                                        </NavLink>
                                      );
                                    })}
                                    {visible.length > max && !showAll && (
                                      <button
                                        onClick={(e) => { e.preventDefault(); setFlagsExpanded(prev => new Set([...prev, inst.id])); }}
                                        className="bg-secondary border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-2 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50/30 dark:hover:bg-cyan-500/5 transition-all flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer"
                                      >
                                        <span className="text-xs font-medium">+{visible.length - max}</span>
                                        <span className="text-[9px]">{t('common.showAll')}</span>
                                      </button>
                                    )}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
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