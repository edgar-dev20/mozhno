export function aggregateMetricsByFlag(metrics: { flagId: number; evaluationTrueCount: number; evaluationFalseCount: number; timeBucket: string }[]): { totalTrue: number; totalFalse: number; buckets: { trueCount: number; falseCount: number; timeBucket: string }[] } {
  let totalTrue = 0;
  let totalFalse = 0;
  const buckets = metrics.map(m => {
    totalTrue += m.evaluationTrueCount;
    totalFalse += m.evaluationFalseCount;
    return { trueCount: m.evaluationTrueCount, falseCount: m.evaluationFalseCount, timeBucket: m.timeBucket };
  });
  return { totalTrue, totalFalse, buckets };
}
