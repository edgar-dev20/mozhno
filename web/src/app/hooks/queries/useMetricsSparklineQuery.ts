import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

function buildSparklineMap(data: Awaited<ReturnType<typeof api.metrics.listForProject>>) {
  const now = new Date();
  const currentHourMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
  );
  const map = new Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>();
  const raw = new Map<string, Map<number, { trueCount: number; falseCount: number }>>();

  for (const m of data) {
    const key = `${m.flagId}-${m.environmentId}`;
    if (!raw.has(key)) raw.set(key, new Map());
    raw.get(key)!.set(Date.parse(m.timeBucket), {
      trueCount: m.evaluationTrueCount,
      falseCount: m.evaluationFalseCount,
    });
  }

  for (const [key, bucketMap] of raw) {
    const items: { trueCount: number; falseCount: number; timeBucket: string }[] = [];
    for (let i = 47; i >= 0; i--) {
      const t = currentHourMs - i * 3600000;
      const found = bucketMap.get(t);
      items.push({
        timeBucket: new Date(t).toISOString(),
        trueCount: found?.trueCount ?? 0,
        falseCount: found?.falseCount ?? 0,
      });
    }
    map.set(key, items);
  }

  return map;
}

export type SparklineData = ReturnType<typeof buildSparklineMap>;

export function useMetricsSparklineQuery(environmentsLength: number, flagsLength: number) {
  return useQuery({
    queryKey: queryKeys.metrics.sparkline,
    queryFn: async () => {
      const data = await api.metrics.listForProject();
      return buildSparklineMap(data);
    },
    enabled: environmentsLength > 0 && flagsLength > 0,
    staleTime: 60_000,
  });
}
