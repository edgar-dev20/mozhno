import { useState, useEffect, useCallback } from 'react';
import { Filter, Clock, User, Activity, Flag, Users, Tag, Key, Layers, Globe, GitBranch, Blocks, ScanSearch, ChevronDown, ChevronUp, Monitor } from "@/shared/icons";
import { motion, AnimatePresence } from 'motion/react';
import { api, AuditEvent } from "@/api";
import { TipCard } from "@/app/components/TipCard";
import { SectionHeader, EmptyState, LoadingState, DateRangePicker } from "@/shared";
import { useProjectQuery } from '@/app/hooks/queries';
import { useQuery } from '@tanstack/react-query';
import { useT } from '@/i18n';
import { loadLocale, toIntlLocale } from '@/i18n/locale';

const PAGE_SIZE = 50;

export function AuditLog() {
  const t = useT();
  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { isLoading: loading, refetch: refetchEvents } = useQuery({
    queryKey: ['audit', projectId, dateFrom, dateTo],
    queryFn: async () => {
      if (!projectId) return [];
      const data = await api.audit.list(0, PAGE_SIZE, dateFrom || undefined, dateTo || undefined);
      return data;
    },
    enabled: !!projectId,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (projectId) {
      refetchEvents().then(result => {
        if (result.data) {
          setEvents(result.data);
          setHasMore(result.data.length === PAGE_SIZE);
          setExpandedIds(new Set());
        }
      });
    }
  }, [projectId, dateFrom, dateTo, refetchEvents]);

  const loadEvents = useCallback(async (page: number, append: boolean) => {
    if (!projectId) return;
    setLoadingMore(true);
    try {
      const data = await api.audit.list(page, PAGE_SIZE, dateFrom || undefined, dateTo || undefined);
      if (append) {
        setEvents(prev => [...prev, ...data]);
      } else {
        setEvents(data);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      if (import.meta.env.DEV) console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [projectId, dateFrom, dateTo]);

  const handleLoadMore = () => {
    const nextPage = Math.floor(events.length / PAGE_SIZE);
    loadEvents(nextPage, true);
  };

  const toDateStr = (d: Date | undefined): string => {
    if (!d) return '';
    return d.toISOString().slice(0, 10);
  };

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(toDateStr(from));
    setDateTo(toDateStr(to));
  };

  const resourceTypes = ['flag', 'user', 'tag', 'apikey', 'segment', 'project', 'environment', 'context', 'strategy', 'integration'];

  const getResourceIcon = (type: string, sz?: number) => {
    const s = sz ?? 14;
    switch (type) {
      case 'flag': return <Flag size={s} />;
      case 'user': return <User size={s} />;
      case 'tag': return <Tag size={s} />;
      case 'apikey': return <Key size={s} />;
      case 'segment': return <Users size={s} />;
      case 'project': return <Layers size={s} />;
      case 'environment': return <Globe size={s} />;
      case 'context': return <Filter size={s} />;
      case 'strategy': return <GitBranch size={s} />;
      case 'integration': return <Blocks size={s} />;
      default: return <Activity size={s} />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'flag': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
      case 'user': return 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20';
      case 'tag': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'apikey': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'segment': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20';
      case 'project': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20';
      case 'environment': return 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20';
      case 'context': return 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20';
      case 'strategy': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20';
      case 'integration': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
      default: return 'text-muted-foreground bg-secondary dark:bg-neutral-500/10 border-border dark:border-neutral-500/20';
    }
  };

  const resourceLabelMap: Record<string, string> = {
    flag: t('audit.resource.flag'),
    user: t('audit.resource.user'),
    tag: t('audit.resource.tag'),
    apikey: t('audit.resource.apikey'),
    segment: t('audit.resource.segment'),
    project: t('audit.resource.project'),
    environment: t('audit.resource.environment'),
    context: t('audit.resource.context'),
    strategy: t('audit.resource.strategy'),
    integration: t('audit.resource.integration'),
  };

  const getResourceLabel = (type: string) => {
    return resourceLabelMap[type] ?? type;
  };

  const actionLabelMap: Record<string, string> = {
    created: t('audit.action.created'),
    updated: t('audit.action.updated'),
    deleted: t('audit.action.deleted'),
    archived: t('audit.action.archived'),
    unarchived: t('audit.action.unarchived'),
    purged: t('audit.action.purged'),
  };

  const getActionLabel = (action: string) => {
    if (action.endsWith('.created')) return actionLabelMap['created'];
    if (action.endsWith('.updated')) return actionLabelMap['updated'];
    if (action.endsWith('.deleted')) return actionLabelMap['deleted'];
    if (action.endsWith('.archived')) return actionLabelMap['archived'];
    if (action.endsWith('.unarchived')) return actionLabelMap['unarchived'];
    if (action.endsWith('.purged')) return actionLabelMap['purged'];
    return action;
  };

  const formatDateTime = (d: string) => {
    return new Date(d).toLocaleString(toIntlLocale(loadLocale()), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDateOnly = (d: string) => {
    return new Date(d).toLocaleDateString(toIntlLocale(loadLocale()), { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTimeOnly = (d: string) => {
    return new Date(d).toLocaleTimeString(toIntlLocale(loadLocale()), { hour: '2-digit', minute: '2-digit' });
  };

  const displayedEvents = filterType ? events.filter(e => e.resourceType === filterType) : events;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('audit.title')}
        description={t('audit.description')}
      />

      <TipCard
        text={t('audit.tipText')}
        label={t('audit.tipLabel')}
        icon={<ScanSearch />}
        storageKey="auditlog"
      />

      <div className="bg-card rounded-2xl p-4 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mr-1">{t('audit.filterType')}</span>
            <button
              onClick={() => setFilterType(null)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
                !filterType
                  ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
              }`}
            >
              {t('common.all')}
            </button>
            {resourceTypes.map(type => {
              const active = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(active ? null : type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
                    active ? getResourceColor(type) + ' border-current/20'
                    : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
                  }`}
                >
                  {getResourceIcon(type)}
                  {getResourceLabel(type)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{t('audit.period')}</span>
          <DateRangePicker
            from={dateFrom ? new Date(dateFrom) : null}
            to={dateTo ? new Date(dateTo) : null}
            onChange={handleDateChange}
            presets
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <LoadingState text={t('audit.loading')} />
        ) : displayedEvents.length === 0 ? (
          <EmptyState
            icon={<Activity size={24} className="text-violet-500 dark:text-violet-400" />}
            title={t('audit.emptyTitle')}
            description={filterType || dateFrom || dateTo ? t('audit.emptyFiltered') : t('audit.emptyDescription')}
          />
        ) : (
          <>
          <AnimatePresence mode="popLayout">
            {displayedEvents.map((event, idx) => {
              const expanded = expandedIds.has(event.id);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: Math.min(idx % PAGE_SIZE, 10) * 0.03 }}
                  className="group bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  id={`audit-card-${event.id}`}
                >
                  <div
                    className="flex gap-4 px-4 py-3 cursor-pointer"
                    onClick={() => toggleExpand(event.id)}
                  >
                    <div className={`p-2 rounded-lg border shrink-0 ${getResourceColor(event.resourceType)}`}>
                      {getResourceIcon(event.resourceType)}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground truncate group-hover:bg-gradient-to-r group-hover:from-gradient-start group-hover:to-gradient-end group-hover:bg-clip-text group-hover:text-transparent transition-all">
                        {event.userName ?? event.userEmail}
                      </span>
                      <span className="text-xs text-muted-foreground">{getActionLabel(event.action)}</span>
                      <span className="font-semibold text-sm text-foreground/90 truncate">{event.resourceName}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${getResourceColor(event.resourceType)}`}>
                        {getResourceIcon(event.resourceType, 10)}
                        {getResourceLabel(event.resourceType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!expanded && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock size={10} />
                          {formatDateTime(event.createdAt)}
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
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('audit.expanded.id')}</span>
                              <span className="text-xs font-mono text-foreground/80">#{event.id}</span>
                            </div>
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('audit.expanded.user')}</span>
                              <span className="text-xs font-medium text-foreground/80 truncate block">{event.userName ?? event.userEmail}</span>
                              <span className="text-xs text-muted-foreground/70 truncate block">{event.userEmail}</span>
                            </div>
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('audit.expanded.action')}</span>
                              <span className="text-xs font-medium text-foreground/80">{getActionLabel(event.action)}</span>
                              <span className="text-xs font-mono text-muted-foreground/70 block mt-0.5">{event.action}</span>
                            </div>
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('audit.expanded.resource')}</span>
                              <span className="text-xs font-semibold text-foreground/80 truncate block">{event.resourceName}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`inline-flex items-center px-1.5 py-0 rounded text-xs font-semibold border ${getResourceColor(event.resourceType)}`}>{getResourceLabel(event.resourceType)}</span>
                                {event.resourceId && <span className="text-xs font-mono text-muted-foreground">ID:{event.resourceId}</span>}
                              </div>
                            </div>
                            <div className="px-3 py-2.5">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('audit.expanded.date')}</span>
                              <span className="text-xs text-foreground/80 block">{formatDateOnly(event.createdAt)}</span>
                              <span className="text-xs text-muted-foreground/70 block mt-0.5">{formatTimeOnly(event.createdAt)}</span>
                            </div>
                          </div>
                          {event.details && (
                            <div className="px-4 py-2.5 border-t border-border">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('audit.expanded.details')}</span>
                              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">{event.details}</p>
                            </div>
                          )}
                          {event.ipAddress && (
                            <div className="px-4 py-2 border-t border-border">
                              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-1">{t('audit.expanded.ip')}</span>
                              <span className="text-xs font-mono text-foreground/80 flex items-center gap-1.5">
                                <Monitor size={11} className="text-muted-foreground shrink-0" />
                                {event.ipAddress}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {hasMore && (
            <div className="flex items-center justify-center pt-3 pb-1">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-xl hover:border-violet-400 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 transition-all shadow-sm disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-violet-500 rounded-full animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.showMore')
                )}
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}