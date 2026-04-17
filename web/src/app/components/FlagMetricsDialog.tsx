import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from "@/shared/icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { api, Environment, FlagMetric } from "@/api";
import { useT } from '@/i18n';

function formatHourBucket(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

interface FlagMetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flagId: number;
  flagName: string;
  environments: Environment[];
  defaultEnvId?: number;
}

export function FlagMetricsDialog({ open, onOpenChange, flagId, flagName, environments, defaultEnvId }: FlagMetricsDialogProps) {
  const t = useT();
  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<FlagMetric[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedEnvId(defaultEnvId ?? environments[0]?.id ?? null);
    } else {
      setMetrics([]);
    }
  }, [open, defaultEnvId, environments]);

  useEffect(() => {
    if (!open || !flagId || !selectedEnvId) {
      setMetrics([]);
      return;
    }
    setLoading(true);
    api.metrics.get(flagId, selectedEnvId)
      .then(data => setMetrics(data))
      .catch(() => setMetrics([]))
      .finally(() => setLoading(false));
  }, [open, flagId, selectedEnvId]);

  const chartData = (() => {
    const buckets = new Map<number, FlagMetric>();
    for (const m of metrics) {
      buckets.set(Date.parse(m.timeBucket), m);
    }
    const now = new Date();
    const currentHourMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours());
    const result = [];
    for (let i = 47; i >= 0; i--) {
      const t = currentHourMs - i * 3600000;
      const iso = new Date(t).toISOString();
      const found = buckets.get(t);
      result.push({
        time: formatHourBucket(iso),
        trueCount: found?.evaluationTrueCount ?? 0,
        falseCount: found?.evaluationFalseCount ?? 0,
      });
    }
    return result;
  })();

  const totalTrue = metrics.reduce((sum, m) => sum + m.evaluationTrueCount, 0);
  const totalFalse = metrics.reduce((sum, m) => sum + m.evaluationFalseCount, 0);

  const selectedEnvName = environments.find(e => e.id === selectedEnvId)?.name ?? '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] bg-card border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg blur opacity-30"></div>
              <div className="relative bg-gradient-to-r from-gradient-start/10 to-gradient-end/10 dark:from-blue-500/5 dark:to-violet-500/5 rounded-lg p-1.5">
                <BarChart3 size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">
              {selectedEnvName
                ? t('flags.metrics.titleWithEnv', { flag: flagName, env: selectedEnvName })
                : t('flags.metrics.title', { flag: flagName })
              }
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">{t('flags.metrics.chartTitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!defaultEnvId && (
            <div className="w-56">
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                {t('clientInstances.environment')}
              </label>
              <Select
                value={selectedEnvId?.toString() ?? ''}
                onValueChange={(v) => setSelectedEnvId(v ? parseInt(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('flags.metrics.selectEnv')} />
                </SelectTrigger>
                <SelectContent>
                  {environments.map(e => (
                    <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="border border-border rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{t('flags.metrics.chartTitle')}</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-start" />
                  <span className="text-muted-foreground/80">true {totalTrue}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-start/30" />
                  <span className="text-muted-foreground/80">false {totalFalse}</span>
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gradient-start/50 border-t-transparent" />
              </div>
            ) : totalTrue === 0 && totalFalse === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-muted-foreground/70">
                {t('flags.metrics.noData')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    interval={Math.max(0, Math.floor(chartData.length / 6))}
                    angle={0}
                    height={24}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} allowDecimals={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'var(--popover-foreground)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="falseCount" stackId="a" fill="var(--color-gradient-start)" fillOpacity={0.3} name="false" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="trueCount" stackId="a" fill="var(--color-gradient-start)" name="true" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
