import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { api, Environment, FlagMetric } from '../../api';

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
      <DialogContent className="sm:max-w-[720px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 rounded-lg blur opacity-30"></div>
              <div className="relative bg-gradient-to-r from-blue-500/10 to-violet-500/10 dark:from-blue-500/5 dark:to-violet-500/5 rounded-lg p-1.5">
                <BarChart3 size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              {flagName}{selectedEnvName ? ` · ${selectedEnvName}` : ''}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!defaultEnvId && (
            <div className="w-56">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Окружение
              </label>
              <Select
                value={selectedEnvId?.toString() ?? ''}
                onValueChange={(v) => setSelectedEnvId(v ? parseInt(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите окружение" />
                </SelectTrigger>
                <SelectContent>
                  {environments.map(e => (
                    <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Статистика активации флага за 48 часов</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#8b5cf6]" />
                  <span className="text-neutral-500">true {totalTrue}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#c4b5fd]" />
                  <span className="text-neutral-500">false {totalFalse}</span>
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-neutral-400 dark:text-neutral-500">
                Нет данных за последние 48 часов
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    interval={Math.max(0, Math.floor(chartData.length / 6))}
                    angle={0}
                    height={24}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e1b4b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="falseCount" stackId="a" fill="#c4b5fd" name="false" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="trueCount" stackId="a" fill="#8b5cf6" name="true" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
