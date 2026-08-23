import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BarChart3, X, Server, ChevronDown, Monitor } from '@/shared/icons';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { api, Environment, FlagMetric, FlagContributor } from '@/api';
import { Drawer } from 'vaul';
import { timeAgo, StatusDot, getErrorMessage, russianPlural } from '@/shared';
import { useT, useLocale } from '@/i18n';
import { toast } from 'sonner';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { JavaIcon, JavaScriptIcon } from '@/app/components/LanguageIcons';

const ACTIVE_MS = 5 * 60 * 1000;
const RECENT_MS = 60 * 60 * 1000;

function formatHourBucket(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `${hh}:${mm}`;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${MM} ${hh}:${mm}`;
}

import { loadLocale, toIntlLocale } from '@/i18n/locale';

function formatNumber(n: number): string {
  return new Intl.NumberFormat(toIntlLocale(loadLocale())).format(n);
}

interface FlagMetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flagId: number;
  flagName: string;
  environments: Environment[];
  defaultEnvId?: number;
}

function getSdkLabel(appType: string) {
  if (appType === 'java') return 'Java SDK';
  if (appType === 'js') return 'JS SDK';
  return appType;
}

function getStaleness(lastSeenAt: string): 'active' | 'recent' | 'stale' {
  const age = Date.now() - new Date(lastSeenAt).getTime();
  if (age <= ACTIVE_MS) return 'active';
  if (age <= RECENT_MS) return 'recent';
  return 'stale';
}

export function FlagMetricsDialog({
  open,
  onOpenChange,
  flagId,
  flagName,
  environments,
  defaultEnvId,
}: FlagMetricsDialogProps) {
  const t = useT();
  const { locale } = useLocale();
  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<FlagMetric[]>([]);
  const [staleMetrics, setStaleMetrics] = useState<FlagMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [contributors, setContributors] = useState<FlagContributor[]>([]);
  const [contributorsLoading, setContributorsLoading] = useState(false);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);
  const [filterAppName, setFilterAppName] = useState<string | null>(null);
  const [filterInstanceId, setFilterInstanceId] = useState<number | null>(null);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDims, setChartDims] = useState({ width: 300, height: 200 });
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setChartDims({ width, height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, chartReady]);

  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, []);

  // Reset filters when dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedEnvId(defaultEnvId ?? environments[0]?.id ?? null);
      setFilterAppName(null);
      setFilterInstanceId(null);
    }
  }, [open, defaultEnvId, environments]);

  // Reset filters and collapse expansions when environment changes
  useEffect(() => {
    if (!open || !selectedEnvId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilterAppName(null);
    setFilterInstanceId(null);
    setExpandedApps(new Set());
  }, [open, selectedEnvId]);

  useEffect(() => {
    if (!open || !flagId || !selectedEnvId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = setTimeout(() => {
      api.metrics
        .get(
          flagId,
          selectedEnvId,
          filterInstanceId
            ? { instanceId: filterInstanceId }
            : filterAppName
              ? { appName: filterAppName }
              : undefined,
        )
        .then((metricsData) => {
          setMetrics(metricsData);
          setStaleMetrics(metricsData);
          setHasEverLoaded(true);
          setChartReady(true);
        })
        .catch((err) => {
          toast.error(getErrorMessage(err));
          setMetrics([]);
          setChartReady(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 350);
  }, [open, flagId, selectedEnvId, filterAppName, filterInstanceId]);

  useEffect(() => {
    if (!open || !flagId || !selectedEnvId) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContributorsLoading(true);
    api.metrics
      .contributors(flagId, selectedEnvId)
      .then((data) => {
        if (!cancelled) setContributors(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(getErrorMessage(err));
          setContributors([]);
        }
      })
      .finally(() => {
        if (!cancelled) setContributorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, flagId, selectedEnvId]);

  const displayMetrics = loading && staleMetrics.length > 0 ? staleMetrics : metrics;

  const chartData = (() => {
    const buckets = new Map<number, FlagMetric>();
    for (const m of displayMetrics) {
      buckets.set(Date.parse(m.timeBucket), m);
    }
    const now = new Date();
    const currentHourMs = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
    );
    const result = [];
    for (let i = 23; i >= 0; i--) {
      const t1 = currentHourMs - (i * 2 + 1) * 3600000;
      const t2 = currentHourMs - i * 2 * 3600000;
      const iso = new Date(t2).toISOString();
      const m1 = buckets.get(t1);
      const m2 = buckets.get(t2);
      result.push({
        time: formatHourBucket(iso),
        trueCount: (m1?.evaluationTrueCount ?? 0) + (m2?.evaluationTrueCount ?? 0),
        falseCount: (m1?.evaluationFalseCount ?? 0) + (m2?.evaluationFalseCount ?? 0),
      });
    }
    return result;
  })();

  const totalTrue = displayMetrics.reduce((sum, m) => sum + m.evaluationTrueCount, 0);
  const totalFalse = displayMetrics.reduce((sum, m) => sum + m.evaluationFalseCount, 0);
  const totalEvaluations = totalTrue + totalFalse;
  const hasTrue = totalTrue > 0;

  const trueRate =
    totalEvaluations > 0 ? `${((totalTrue / totalEvaluations) * 100).toFixed(1)}%` : '—';

  const peakMetric =
    displayMetrics.length > 0
      ? displayMetrics.reduce((a, b) =>
          a.evaluationTrueCount + a.evaluationFalseCount >
          b.evaluationTrueCount + b.evaluationFalseCount
            ? a
            : b,
        )
      : null;
  const peakTime = peakMetric ? formatHourBucket(peakMetric.timeBucket) : '—';

  const activeBuckets = chartData.filter((d) => d.trueCount + d.falseCount > 0).length;
  const avgPerHour = activeBuckets > 0 ? Math.round(totalEvaluations / activeBuckets) : 0;

  const selectedEnvName = environments.find((e) => e.id === selectedEnvId)?.name ?? '';

  const stats = [
    {
      value: totalEvaluations > 0 ? formatNumber(totalEvaluations) : '—',
      label: t('flags.metrics.totalEvals'),
    },
    { value: trueRate, label: t('flags.metrics.trueRate') },
    { value: peakTime, label: t('flags.metrics.peak') },
    {
      value: avgPerHour > 0 ? formatNumber(avgPerHour) : '—',
      label: t('flags.metrics.avgPerHour'),
    },
  ];

  const pluralNoun = (n: number, ru: [string, string, string], en: [string, string]) =>
    locale === 'ru' ? russianPlural(n, ru[0], ru[1], ru[2]) : n === 1 ? en[0] : en[1];

  const evalsNoun = (n: number) =>
    pluralNoun(n, ['оценка', 'оценки', 'оценок'], ['evaluation', 'evaluations']);
  const instancesNoun = (n: number) =>
    pluralNoun(n, ['экземпляр', 'экземпляра', 'экземпляров'], ['instance', 'instances']);

  const contributorGroups = (() => {
    const groups = new Map<string, FlagContributor[]>();
    for (const c of contributors) {
      const list = groups.get(c.appName) ?? [];
      list.push(c);
      groups.set(c.appName, list);
    }
    return Array.from(groups.entries())
      .map(([appName, insts]) => ({
        appName,
        appType: insts[0]?.appType ?? 'unknown',
        total: insts.reduce(
          (sum, c) => sum + c.evaluationTrueCount + c.evaluationFalseCount,
          0,
        ),
        instances: [...insts].sort(
          (a, b) =>
            b.evaluationTrueCount +
            b.evaluationFalseCount -
            (a.evaluationTrueCount + a.evaluationFalseCount),
        ),
      }))
      .sort((a, b) => b.total - a.total);
  })();

  const attributedTotal = contributors.reduce(
    (sum, c) => sum + c.evaluationTrueCount + c.evaluationFalseCount,
    0,
  );

  const sharePct = (value: number, total: number) =>
    total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '—';

  const getAppIcon = (appType: string, size = 16) => {
    if (appType === 'java') return <JavaIcon size={size} />;
    if (appType === 'js') return <JavaScriptIcon size={size} />;
    return <Monitor size={size} className="text-brand" />;
  };

  const filterInstance =
    filterInstanceId != null
      ? (contributors.find((c) => c.instanceId === filterInstanceId) ?? null)
      : null;

  const clearFilters = () => {
    setFilterAppName(null);
    setFilterInstanceId(null);
  };

  const selectApp = (appName: string) => {
    if (filterAppName === appName && filterInstanceId === null) {
      clearFilters();
    } else {
      setFilterAppName(appName);
      setFilterInstanceId(null);
    }
  };

  const selectInstance = (appName: string, instanceId: number) => {
    if (filterInstanceId === instanceId) {
      clearFilters();
    } else {
      setFilterAppName(appName);
      setFilterInstanceId(instanceId);
    }
  };

  const toggleExpand = (appName: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appName)) {
        next.delete(appName);
      } else {
        next.add(appName);
      }
      return next;
    });
  };

  const isMobile = useIsMobile(640);

  const closeButton = (
    <button
      onClick={() => onOpenChange(false)}
      aria-label={t('common.close')}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
    >
      <X size={20} />
    </button>
  );

  const header = (
    <div className="flex-shrink-0 px-4 sm:px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="relative shrink-0">
          <div className="bg-gradient-to-r from-gradient-start/10 to-gradient-end/10 dark:from-primary/5 dark:to-info/5 rounded-lg p-1.5">
            <BarChart3 size={18} className="text-brand" />
          </div>
        </div>
        <span className="text-body-sm font-semibold text-foreground truncate">{flagName}</span>
        <span className="text-muted-foreground/60 shrink-0">·</span>
        {defaultEnvId ? (
          <span className="text-caption font-medium text-muted-foreground truncate">
            {selectedEnvName}
          </span>
        ) : (
          <Select
            value={selectedEnvId?.toString() ?? ''}
            onValueChange={(v) => setSelectedEnvId(v ? parseInt(v) : null)}
          >
            <SelectTrigger className="h-7 text-caption gap-1 border-0 bg-transparent hover:bg-secondary/50 px-2 w-auto min-w-0">
              <SelectValue placeholder={t('flags.metrics.selectEnv')} />
            </SelectTrigger>
            <SelectContent>
              {environments.map((e) => (
                <SelectItem key={e.id} value={e.id.toString()}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {closeButton}
    </div>
  );

  const body = (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
      {/* Stats bar — always visible */}
      <div className="flex-shrink-0 min-h-[56px] flex items-stretch divide-x divide-border/30 bg-secondary/30 mx-5 mt-5 rounded-xl overflow-hidden shadow-sm">
        {stats.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-center py-2.5 px-1">
            <span className={`text-body font-medium leading-none tracking-tight ${totalEvaluations > 0 ? 'text-foreground/85' : 'text-muted-foreground'}`}>
              {s.value}
            </span>
            <span className="text-caption text-muted-foreground mt-1 leading-none">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div className="flex-shrink-0 mx-5 mt-4 h-[280px] min-h-[280px] flex flex-col rounded-xl shadow-md bg-card ring-1 ring-border p-4">
        <div className="flex-shrink-0 flex flex-col gap-2 mb-3">
          <span className="text-caption font-semibold text-muted-foreground">
            {t('flags.metrics.chartTitle')}
          </span>
          <div className="flex items-center gap-4 text-caption">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sparkline-true" />
              <span className="text-muted-foreground">
                true {totalTrue > 0 ? formatNumber(totalTrue) : '—'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sparkline-false" />
              <span className="text-muted-foreground">
                false {totalFalse > 0 ? formatNumber(totalFalse) : '—'}
              </span>
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-[100px] relative">
          <div ref={chartRef} className={`h-full transition-opacity duration-300 ${!chartReady && !hasEverLoaded ? 'invisible' : loading ? 'opacity-50' : 'opacity-100'}`}>
            {loading && (
              <div className="absolute top-2 right-2 z-10">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-sparkline-true/30 border-t-sparkline-true" />
              </div>
            )}
            <BarChart width={chartDims.width} height={chartDims.height} data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="12%" maxBarSize={20}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} interval={Math.max(0, Math.floor(chartData.length / 4))} height={30} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} allowDecimals={false} width={40} />
              <Tooltip cursor={{ stroke: 'var(--color-sparkline-false)', strokeWidth: 1, strokeOpacity: 0.25 }} contentStyle={{ backgroundColor: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-popover-foreground)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: '12px', padding: '10px 14px' }} />
              <Bar dataKey="falseCount" stackId="a" fill="var(--sparkline-false)" name="false" radius={hasTrue ? undefined : [3, 3, 0, 0]} />
              <Bar dataKey="trueCount" stackId="a" fill="var(--sparkline-true)" name="true" radius={[3, 3, 0, 0]} />
            </BarChart>
          </div>
          {!chartReady && !hasEverLoaded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-sparkline-true/30 border-t-sparkline-true" />
              <span className="text-caption text-muted-foreground">{t('common.loading')}</span>
            </div>
          ) : totalTrue === 0 && totalFalse === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-card">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted">
                <BarChart3 size={28} className="text-muted-foreground" />
              </div>
              <span className="text-body-sm text-muted-foreground">
                {filterAppName || filterInstanceId
                  ? t('flags.metrics.filteredEmpty')
                  : t('flags.metrics.noData')}
              </span>
              {(filterAppName || filterInstanceId) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-body-sm font-medium"
                >
                  {t('flags.metrics.showAll')}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Filter breadcrumb */}
      {(filterAppName || filterInstanceId) && (
        <div className="flex-shrink-0 mx-5 mt-3 flex items-center gap-1.5 text-caption">
          <span className="text-muted-foreground">{t('common.showing')}</span>
          <button onClick={clearFilters} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-muted-foreground hover:bg-accent/80 transition-colors font-medium">{t('common.all')}</button>
          {filterAppName && (
            <>
              <span className="text-muted-foreground/60">→</span>
              <button onClick={() => setFilterInstanceId(null)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sparkline-true/10 text-success dark:text-palette-success-700 font-medium transition-colors hover:bg-sparkline-true/20">{filterAppName}</button>
            </>
          )}
          {filterInstance && (
            <>
              <span className="text-muted-foreground/60">→</span>
              <button onClick={() => setFilterInstanceId(null)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sparkline-true/10 text-success dark:text-palette-success-700 font-medium font-mono transition-colors hover:bg-sparkline-true/20">{filterInstance.sdkInstanceId}</button>
            </>
          )}
          <button onClick={clearFilters} aria-label={t('common.clearFilter')} className="ml-2 p-1.5 rounded text-muted-foreground/70 dark:text-muted-foreground hover:text-foreground/60 transition-colors"><X size={12} /></button>
        </div>
      )}

      {/* Contributors */}
      <div className="flex-shrink-0 mx-5 mt-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Server size={13} className="text-muted-foreground" />
          <span className="text-caption font-semibold text-muted-foreground">{t('flags.metrics.contributorsTitle')}</span>
          {contributors.length > 0 && (
            <span className="text-caption text-muted-foreground">
              {formatNumber(attributedTotal)} {evalsNoun(attributedTotal)}
            </span>
          )}
        </div>

        {contributorsLoading && contributors.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (<div key={i} className="h-14 bg-secondary/60 rounded-xl animate-pulse" />))}
          </div>
        ) : contributors.length === 0 ? (
          <div className="rounded-xl bg-muted px-4 py-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Server size={24} className="text-muted-foreground" />
              <p className="text-body-sm font-medium text-muted-foreground">{t('flags.metrics.noContributorsTitle')}</p>
              <p className="text-caption text-muted-foreground max-w-xs">{t('flags.metrics.noContributorsDesc')}</p>
            </div>
          </div>
        ) : filterAppName && !contributorGroups.some((g) => g.appName === filterAppName) ? (
          <div className="rounded-xl bg-muted px-4 py-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-caption text-muted-foreground">{t('flags.metrics.filteredEmpty')}</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-body-sm font-medium"
              >
                {t('flags.metrics.showAll')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={clearFilters}
              aria-pressed={!filterAppName && !filterInstanceId}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
                !filterAppName && !filterInstanceId
                  ? 'bg-gradient-to-br from-sparkline-true/[0.04] to-transparent ring-1 ring-sparkline-true/25'
                  : 'bg-card border border-border shadow-sm hover:shadow-md'
              }`}
            >
              <span className="text-body font-semibold text-foreground/85">{t('flags.metrics.allApps')}</span>
              <span className="text-caption text-muted-foreground tabular-nums">
                {formatNumber(attributedTotal)} {evalsNoun(attributedTotal)}
              </span>
            </button>

            {contributorGroups.map((group) => {
              const isAppSelected = filterAppName === group.appName && filterInstanceId === null;
              const isAppFilterActive = filterAppName === group.appName;
              const isDimmed = (filterAppName || filterInstanceId) && !isAppFilterActive;
              const share = sharePct(group.total, attributedTotal);
              const shareWidth = attributedTotal > 0 ? (group.total / attributedTotal) * 100 : 0;
              const expanded = expandedApps.has(group.appName);
              const hasMultipleInstances = group.instances.length > 1;
              return (
                <div
                  key={group.appName}
                  className={`rounded-xl overflow-hidden transition-all duration-200 ${
                    isDimmed ? 'opacity-50' : ''
                  } ${
                    isAppSelected
                      ? 'bg-gradient-to-br from-sparkline-true/[0.04] to-transparent ring-1 ring-sparkline-true/25 shadow-md'
                      : 'bg-card shadow-sm border border-border'
                  }`}
                >
                  <div className="flex items-stretch">
                    <button
                      onClick={() => selectApp(group.appName)}
                      aria-pressed={isAppFilterActive}
                      className="flex-1 min-w-0 flex items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-secondary/40 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                    >
                      <div className="p-1.5 rounded-lg shrink-0 bg-muted">{getAppIcon(group.appType, 16)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`text-body font-semibold truncate ${isAppFilterActive ? 'text-success dark:text-palette-success-700' : 'text-foreground/85'}`}>
                            {group.appName}
                          </span>
                          <span className="text-caption text-muted-foreground tabular-nums shrink-0">
                            {formatNumber(group.total)} {evalsNoun(group.total)} · {share}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-secondary/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sparkline-true transition-all duration-300"
                            style={{ width: `${Math.min(100, shareWidth)}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="text-caption text-muted-foreground">{getSdkLabel(group.appType)}</span>
                          <span className="text-caption text-muted-foreground tabular-nums">
                            {group.instances.length} {instancesNoun(group.instances.length)}
                          </span>
                        </div>
                      </div>
                    </button>
                    {hasMultipleInstances && (
                      <button
                        onClick={() => toggleExpand(group.appName)}
                        aria-expanded={expanded}
                        aria-label={expanded ? t('common.collapse') : t('common.expand')}
                        className="shrink-0 px-2.5 flex items-center text-muted-foreground hover:text-foreground transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                      >
                        <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {expanded && hasMultipleInstances && (
                    <div className="border-t border-border/60 px-2 py-1.5 space-y-1">
                      {group.instances.map((inst) => {
                        const isInstSelected = filterInstanceId === inst.instanceId;
                        const instShare = sharePct(
                          inst.evaluationTrueCount + inst.evaluationFalseCount,
                          group.total,
                        );
                        const staleness = getStaleness(inst.lastSeenAt);
                        return (
                          <button
                            key={inst.instanceId}
                            onClick={() => selectInstance(group.appName, inst.instanceId)}
                            aria-pressed={isInstSelected}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 text-left focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
                              isInstSelected
                                ? 'bg-sparkline-true/10 ring-1 ring-sparkline-true/25'
                                : 'hover:bg-secondary/40'
                            }`}
                          >
                            <StatusDot state={staleness} />
                            <span className={`font-mono text-caption font-medium truncate min-w-0 flex-1 ${isInstSelected ? 'text-success dark:text-palette-success-700' : 'text-foreground/85'}`}>
                              {inst.sdkInstanceId}
                            </span>
                            {inst.sdkVersion && (
                              <span className="text-caption text-muted-foreground font-mono shrink-0">v{inst.sdkVersion}</span>
                            )}
                            <span className="text-caption text-muted-foreground tabular-nums shrink-0">{instShare}</span>
                            <span className="text-caption text-muted-foreground tabular-nums w-14 text-right shrink-0">
                              {timeAgo(inst.lastSeenAt)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange} direction="bottom">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-overlay backdrop-blur-sm z-40" />
          <Drawer.Content className="bg-card border-t border-border rounded-t-3xl z-50 fixed bottom-0 left-0 right-0 max-h-[92dvh] flex flex-col outline-none" aria-label={flagName}>
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-muted-foreground/20 flex-shrink-0" />
            {header}
            {body}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300" />
        <Dialog.Content className="fixed right-4 top-4 bottom-4 w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:[--tw-exit-translate-x:calc(100%+1rem)] data-[state=open]:slide-in-from-right-full duration-300" aria-label={flagName}>
          {header}
          {body}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
