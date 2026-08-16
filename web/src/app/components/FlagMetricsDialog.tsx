import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BarChart3, X, Server } from '@/shared/icons';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { api, Environment, FlagMetric, ClientInstance } from '@/api';
import { Drawer } from 'vaul';
import { timeAgo, Card, CardHeader, Hairline, StatusDot, TruncatedCopyTooltip, getErrorMessage, getEnvColor } from '@/shared';
import { motion, AnimatePresence } from 'motion/react';
import { useT } from '@/i18n';
import { toast } from 'sonner';
import { useIsMobile } from '@/shared/hooks/useIsMobile';

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
  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<FlagMetric[]>([]);
  const [staleMetrics, setStaleMetrics] = useState<FlagMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [instances, setInstances] = useState<ClientInstance[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);
  const [filterAppName, setFilterAppName] = useState<string | null>(null);
  const [filterInstanceId, setFilterInstanceId] = useState<number | null>(null);

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

  const projectId = environments[0]?.projectId ?? 0;

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
    if (!open || !projectId || !selectedEnvId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstancesLoading(true);
    api.clientInstances
      .list(selectedEnvId)
      .then((data) => {
        setInstances(
          data.filter((i) => Date.now() - new Date(i.lastSeenAt).getTime() < 24 * 60 * 60 * 1000),
        );
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setInstances([]);
      })
      .finally(() => {
        setInstancesLoading(false);
      });
  }, [open, projectId, selectedEnvId]);

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

  const instanceGroups = (() => {
    const groups = new Map<string, ClientInstance[]>();
    for (const inst of instances) {
      const key = inst.appName;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(inst);
    }
    return Array.from(groups.entries())
      .map(([appName, insts]) => ({
        appName,
        instances: insts,
        appType: insts[0]?.appType ?? 'unknown',
      }))
      .sort((a, b) => a.appName.localeCompare(b.appName));
  })();

  const filterInstance = filterInstanceId ? instances.find((i) => i.id === filterInstanceId) : null;

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
        <span className="text-muted-foreground/30 shrink-0">·</span>
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
            <span className={`text-body font-medium leading-none tracking-tight ${totalEvaluations > 0 ? 'text-foreground/85' : 'text-muted-foreground/40'}`}>
              {s.value}
            </span>
            <span className="text-caption text-muted-foreground/45 mt-1 leading-none">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div className="flex-shrink-0 mx-5 mt-4 h-[280px] min-h-[280px] flex flex-col rounded-xl shadow-md bg-card ring-1 ring-border p-4">
        <div className="flex-shrink-0 flex flex-col gap-2 mb-3">
          <span className="text-caption font-semibold text-muted-foreground/60">
            {t('flags.metrics.chartTitle')}
          </span>
          <div className="flex items-center gap-4 text-caption">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sparkline-true" />
              <span className="text-muted-foreground/60">
                true {totalTrue > 0 ? formatNumber(totalTrue) : '—'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sparkline-false" />
              <span className="text-muted-foreground/60">
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
              <span className="text-caption text-muted-foreground/40">{t('common.loading')}</span>
            </div>
          ) : totalTrue === 0 && totalFalse === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-card">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted">
                <BarChart3 size={28} className="text-muted-foreground/30" />
              </div>
              <span className="text-body-sm text-muted-foreground/40">{t('flags.metrics.noData')}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Filter breadcrumb */}
      {(filterAppName || filterInstanceId) && (
        <div className="flex-shrink-0 mx-5 mt-3 flex items-center gap-1.5 text-caption">
          <span className="text-muted-foreground/70 dark:text-muted-foreground">Showing:</span>
          <button onClick={clearFilters} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-muted-foreground hover:bg-accent/80 transition-colors font-medium">{t('common.all')}</button>
          {filterAppName && (
            <>
              <span className="text-muted-foreground/30">→</span>
              <button onClick={() => { setFilterAppName(null); setFilterInstanceId(null); }} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${filterInstanceId ? 'bg-sparkline-true/10 text-sparkline-true' : 'bg-sparkline-true/10 text-sparkline-true'}`}>{filterAppName}</button>
            </>
          )}
          {filterInstance && (
            <>
              <span className="text-muted-foreground/30">→</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sparkline-true/10 text-sparkline-true font-medium">{filterInstance.instanceId}</span>
            </>
          )}
          <button onClick={clearFilters} aria-label={t('common.clearFilter')} className="ml-2 p-1.5 rounded text-muted-foreground/70 dark:text-muted-foreground hover:text-foreground/60 transition-colors"><X size={12} /></button>
        </div>
      )}

      {/* SDK instances */}
      <div className="flex-shrink-0 mx-5 mt-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Server size={13} className="text-muted-foreground/40" />
          <span className="text-caption font-semibold text-muted-foreground/60">{t('flags.metrics.allApps')}</span>
          {instances.length > 0 && (
            <span className="text-caption text-muted-foreground/30">{t('flags.metrics.appCount', { apps: String(instanceGroups.length), instances: String(instances.length) })}</span>
          )}
        </div>

        {instancesLoading && instances.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (<div key={i} className="h-14 bg-secondary/60 rounded-xl animate-pulse" />))}
          </div>
        ) : instances.length === 0 ? (
          <div className="rounded-xl bg-muted px-4 py-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Server size={24} className="text-muted-foreground/25" />
              <p className="text-caption text-muted-foreground/50">{t('clientInstances.emptyDescription')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Card variant="selectable" selected={!filterAppName && !filterInstanceId} onClick={clearFilters} className="w-full">
              <CardHeader title={t('flags.metrics.allInstances')} subtitle={t('flags.metrics.allInstancesHint')} meta={instances.length} />
            </Card>
            <AnimatePresence mode="popLayout">
              {instanceGroups.map((group, idx) => {
                const isAppSelected = filterAppName === group.appName && filterInstanceId === null;
                const isDimmed = (filterAppName || filterInstanceId) && !isAppSelected && filterAppName !== group.appName;
                return (
                  <motion.div key={group.appName} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2, delay: idx * 0.03 }}>
                    <Card variant="selectable" selected={isAppSelected} dimmed={!!isDimmed} onClick={() => selectApp(group.appName)} className="w-full">
                      <CardHeader title={group.appName} subtitle={t('flags.metrics.instanceCount', { sdk: getSdkLabel(group.appType), count: String(group.instances.length) })} />
                      <Hairline />
                      <div className="px-3 py-2 space-y-1.5">
                        {group.instances.map((inst) => {
                          const isInstSelected = filterInstanceId === inst.id;
                          const staleness = getStaleness(inst.lastSeenAt);
                          const env = environments.find((e) => e.id === inst.environmentId);
                          const envName = env?.name ?? '';
                          const envColor = getEnvColor(env ?? inst.environmentId);
                          return (
                            <div key={inst.id} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); selectInstance(group.appName, inst.id); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectInstance(group.appName, inst.id); } }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${isInstSelected ? 'bg-sparkline-true/10 ring-1 ring-sparkline-true/20' : 'bg-secondary/30 hover:bg-secondary/50'}`}>
                              <StatusDot state={staleness} />
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <TruncatedCopyTooltip value={inst.instanceId} className={`font-mono text-detail font-medium ${isInstSelected ? 'text-sparkline-true' : 'text-foreground/80'}`} />
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {envName && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-caption font-medium bg-secondary/60 text-muted-foreground/60 shrink-0">
                                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: envColor }} />{envName}
                                  </span>
                                )}
                                {inst.sdkVersion && (<span className="text-muted-foreground/35 font-mono text-caption shrink-0">v{inst.sdkVersion}</span>)}
                                <span className="text-muted-foreground/30 text-caption w-14 text-right tabular-nums shrink-0">{timeAgo(inst.lastSeenAt)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
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
