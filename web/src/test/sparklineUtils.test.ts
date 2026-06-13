import { describe, it, expect } from 'vitest';
import { aggregateMetricsByFlag } from "@/shared/sparklineUtils";

describe('aggregateMetricsByFlag', () => {
  it('aggregates totals from metrics', () => {
    const result = aggregateMetricsByFlag([
      { flagId: 1, evaluationTrueCount: 5, evaluationFalseCount: 3, timeBucket: '2024-01-01T00:00:00Z' },
      { flagId: 1, evaluationTrueCount: 2, evaluationFalseCount: 1, timeBucket: '2024-01-01T01:00:00Z' },
    ]);
    expect(result.totalTrue).toBe(7);
    expect(result.totalFalse).toBe(4);
  });

  it('maps buckets correctly', () => {
    const result = aggregateMetricsByFlag([
      { flagId: 1, evaluationTrueCount: 1, evaluationFalseCount: 2, timeBucket: 'a' },
      { flagId: 1, evaluationTrueCount: 3, evaluationFalseCount: 4, timeBucket: 'b' },
    ]);
    expect(result.buckets).toHaveLength(2);
    expect(result.buckets[0]).toEqual({ trueCount: 1, falseCount: 2, timeBucket: 'a' });
    expect(result.buckets[1]).toEqual({ trueCount: 3, falseCount: 4, timeBucket: 'b' });
  });

  it('handles empty array', () => {
    const result = aggregateMetricsByFlag([]);
    expect(result.totalTrue).toBe(0);
    expect(result.totalFalse).toBe(0);
    expect(result.buckets).toHaveLength(0);
  });
});
