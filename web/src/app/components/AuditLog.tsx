import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router';
import {
  Filter,
  Clock,
  User,
  Activity,
  Flag,
  Users,
  Tag,
  Key,
  Layers,
  Globe,
  GitBranch,
  Blocks,
  ScanSearch,
  ChevronDown,
  ChevronUp,
  Monitor,
} from '@/shared/icons';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { api, AuditEvent } from '@/api';
import { TipCard } from '@/app/components/TipCard';
import { SectionHeader, EmptyState, SearchInput, getErrorMessage } from '@/shared';
import { EmptyAuditLogIllustration } from '@/shared/components/illustrations';

const DateRangePicker = lazy(() =>
  import('@/shared/components/DateRangePicker').then((m) => ({ default: m.DateRangePicker })),
);
import { TableSkeleton } from '@/app/components/skeletons';
import { useProjectQuery } from '@/app/hooks/queries';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const [searchParams] = useSearchParams();
  const openParam = searchParams.get('open');
  const openId = openParam ? Number(openParam) : null;
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const scrolledRef = useRef<number | null>(null);

  const effectiveExpanded = useMemo(() => {
    if (openId != null && !isNaN(openId)) {
      const s = new Set(expandedIds);
      s.add(openId);
      return s;
    }
    return expandedIds;
  }, [expandedIds, openId]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const initialLoadDone = useRef(false);

  const { data: auditData, isLoading: loading } = useQuery({
    queryKey: queryKeys.audit.filtered(projectId, dateFrom, dateTo),
    queryFn: async () => {
      if (!projectId) return [];
      const data = await api.audit.list(0, PAGE_SIZE, dateFrom || undefined, dateTo || undefined);
      return data;
    },
    enabled: !!projectId,
    staleTime: 10_000,
  });

  // Sync initial query data to local state for infinite scroll
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!auditData) return;
    initialLoadDone.current = true;
    setEvents(auditData);
    setHasMore(auditData.length === PAGE_SIZE);
    setExpandedIds(new Set());
  }, [auditData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!openParam || events.length === 0) return;
    const id = Number(openParam);
    if (isNaN(id) || !events.some((e) => e.id === id)) return;
    if (scrolledRef.current === id) return;
    scrolledRef.current = id;
    requestAnimationFrame(() => {
      document.getElementById(`audit-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [openParam, events]);

  const loadEvents = useCallback(
    async (page: number, append: boolean) => {
      if (!projectId) return;
      setLoadingMore(true);
      try {
        const data = await api.audit.list(
          page,
          PAGE_SIZE,
          dateFrom || undefined,
          dateTo || undefined,
        );
        if (append) {
          setEvents((prev) => [...prev, ...data]);
        } else {
          setEvents(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoadingMore(false);
      }
    },
    [projectId, dateFrom, dateTo],
  );

  const handleLoadMore = () => {
    const nextPage = Math.floor(events.length / PAGE_SIZE);
    loadEvents(nextPage, true);
  };

  const toDateStr = (d: Date | undefined): string => {
    if (!d) return '';
    return format(d, 'yyyy-MM-dd');
  };

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(toDateStr(from));
    setDateTo(toDateStr(to));
  };

  const resourceTypes = [
    'flag',
    'user',
    'tag',
    'apikey',
    'segment',
    'project',
    'environment',
    'context',
    'strategy',
    'integration',
  ];

  const getResourceIcon = (type: string, sz?: number) => {
    const s = sz ?? 14;
    switch (type) {
      case 'flag':
        return <Flag size={s} />;
      case 'user':
        return <User size={s} />;
      case 'tag':
        return <Tag size={s} />;
      case 'apikey':
        return <Key size={s} />;
      case 'segment':
        return <Users size={s} />;
      case 'project':
        return <Layers size={s} />;
      case 'environment':
        return <Globe size={s} />;
      case 'context':
        return <Filter size={s} />;
      case 'strategy':
        return <GitBranch size={s} />;
      case 'integration':
        return <Blocks size={s} />;
      default:
        return <Activity size={s} />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'flag':
        return 'text-brand bg-brand/10 border-brand/20';
      case 'user':
        return 'text-palette-info-600 dark:text-palette-info-700 bg-info/10 border-info/20';
      case 'tag':
        return 'text-success dark:text-palette-success-700 bg-success/10 border-success/20';
      case 'apikey':
        return 'text-palette-warning-600 dark:text-palette-warning-700 bg-warning/10 border-warning/20';
      case 'segment':
        return 'text-palette-warning-600 dark:text-palette-warning-700 bg-chart-4/10 border-chart-4/20';
      case 'project':
        return 'text-palette-info-600 dark:text-palette-info-700 bg-info/10 border-info/20';
      case 'environment':
        return 'text-success dark:text-palette-success-700 bg-success/10 border-success/20';
      case 'context':
        return 'text-brand bg-brand/10 border-brand/20';
      case 'strategy':
        return 'text-palette-warning-600 dark:text-palette-warning-700 bg-chart-4/10 border-chart-4/20';
      case 'integration':
        return 'text-palette-warning-600 dark:text-palette-warning-700 bg-warning/10 border-warning/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
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
    return new Date(d).toLocaleString(toIntlLocale(loadLocale()), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (d: string) => {
    return new Date(d).toLocaleDateString(toIntlLocale(loadLocale()), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTimeOnly = (d: string) => {
    return new Date(d).toLocaleTimeString(toIntlLocale(loadLocale()), {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedEvents = useMemo(() => {
    let filtered = events;
    if (filterType) {
      filtered = filtered.filter((e) => e.resourceType === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.userName ?? '').toLowerCase().includes(q) ||
          (e.userEmail ?? '').toLowerCase().includes(q) ||
          (e.resourceName ?? '').toLowerCase().includes(q) ||
          (e.action ?? '').toLowerCase().includes(q) ||
          (e.details ?? '').toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [events, filterType, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeader title={t('audit.title')} description={t('audit.description')} />

      <TipCard
        text={t('audit.tipText')}
        label={t('audit.tipLabel')}
        icon={<ScanSearch />}
        storageKey="auditlog"
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('audit.searchPlaceholder')}
      />

      <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-md space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-2">
          <span className="text-caption font-semibold text-muted-foreground/70">
            {t('audit.filterType')}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setFilterType(null)}
              className={`shrink-0 px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border ${
                !filterType
                  ? 'bg-brand/10 text-brand border-brand/20'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
              }`}
            >
              {t('common.all')}
            </button>
            {resourceTypes.map((type) => {
              const active = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(active ? null : type)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border ${
                    active
                      ? getResourceColor(type) + ' border-current/20'
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
          <span className="text-caption font-semibold text-muted-foreground/70">
            {t('audit.period')}
          </span>
          <Suspense fallback={<div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />}>
            <DateRangePicker
              from={dateFrom ? parseISO(dateFrom) : null}
              to={dateTo ? parseISO(dateTo) : null}
              onChange={handleDateChange}
              presets
            />
          </Suspense>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : displayedEvents.length === 0 ? (
          <EmptyState
            illustration={<EmptyAuditLogIllustration />}
            title={t('audit.emptyTitle')}
            description={
              filterType || dateFrom || dateTo || searchQuery
                ? t('audit.emptyFiltered')
                : t('audit.emptyDescription')
            }
          />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {displayedEvents.map((event, idx) => {
                const expanded = effectiveExpanded.has(event.id);
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
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer"
                      onClick={() => toggleExpand(event.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpand(event.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg border shrink-0 ${getResourceColor(event.resourceType)}`}
                        >
                          {getResourceIcon(event.resourceType)}
                        </div>
                        <div className="min-w-0 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-body-sm text-foreground truncate">
                            {event.userName ?? event.userEmail}
                          </span>
                          <span className="text-caption text-muted-foreground shrink-0">
                            {getActionLabel(event.action)}
                          </span>
                          <span className="font-semibold text-body-sm text-foreground/90 truncate">
                            {event.resourceName}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-caption font-semibold border shrink-0 leading-none ${getResourceColor(event.resourceType)}`}
                          >
                            {getResourceIcon(event.resourceType, 10)}
                            {getResourceLabel(event.resourceType)}
                          </span>
                          {event.details && (
                            <span className="text-caption text-muted-foreground/70 truncate max-w-[160px]">
                              — {event.details}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:hidden">
                        <span className="text-caption text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />
                          {formatDateTime(event.createdAt)}
                        </span>
                        {expanded ? (
                          <ChevronUp size={16} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={16} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        {!expanded && (
                          <span className="text-caption text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {formatDateTime(event.createdAt)}
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                              <div className="px-3 py-2.5">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('audit.expanded.id')}
                                </span>
                                <span className="text-caption font-mono text-foreground/80">
                                  #{event.id}
                                </span>
                              </div>
                              <div className="px-3 py-2.5">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('audit.expanded.user')}
                                </span>
                                <span className="text-caption font-medium text-foreground/80 truncate block">
                                  {event.userName ?? event.userEmail}
                                </span>
                                <span className="text-caption text-muted-foreground/70 truncate block">
                                  {event.userEmail}
                                </span>
                              </div>
                              <div className="px-3 py-2.5">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('audit.expanded.action')}
                                </span>
                                <span className="text-caption font-medium text-foreground/80">
                                  {getActionLabel(event.action)}
                                </span>
                                <span className="text-caption font-mono text-muted-foreground/70 block mt-0.5">
                                  {event.action}
                                </span>
                              </div>
                              <div className="px-3 py-2.5">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('audit.expanded.resource')}
                                </span>
                                <span className="text-caption font-semibold text-foreground/80 truncate block">
                                  {event.resourceName}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`inline-flex items-center px-1.5 py-0 rounded text-caption font-semibold border ${getResourceColor(event.resourceType)}`}
                                  >
                                    {getResourceLabel(event.resourceType)}
                                  </span>
                                  {event.resourceId && (
                                    <span className="text-caption font-mono text-muted-foreground">
                                      ID:{event.resourceId}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="px-3 py-2.5">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('audit.expanded.date')}
                                </span>
                                <span className="text-caption text-foreground/80 block">
                                  {formatDateOnly(event.createdAt)}
                                </span>
                                <span className="text-caption text-muted-foreground/70 block mt-0.5">
                                  {formatTimeOnly(event.createdAt)}
                                </span>
                              </div>
                            </div>
                            {event.details && (
                              <div className="px-4 py-2.5 border-t border-border">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('audit.expanded.details')}
                                </span>
                                <p className="text-caption text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                                  {event.details}
                                </p>
                              </div>
                            )}
                            {event.ipAddress && (
                              <div className="px-4 py-2 border-t border-border">
                                <span className="text-caption font-semibold text-muted-foreground/70 block mb-1">
                                  {t('audit.expanded.ip')}
                                </span>
                                <span className="text-caption font-mono text-foreground/80 flex items-center gap-1.5">
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-muted-foreground bg-card border border-border rounded-xl hover:border-brand hover:text-brand transition-all shadow-sm disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />
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
