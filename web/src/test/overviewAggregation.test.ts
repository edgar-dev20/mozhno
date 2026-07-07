import { describe, it, expect } from 'vitest';
import { computeDrift } from '@/shared/overviewAggregation';
import { formatCompactCount } from '@/shared/format';
import type { FlagView } from '@/app/hooks/flagTypes';

const ENVS = [
  { id: 1, name: 'dev' },
  { id: 2, name: 'staging' },
  { id: 3, name: 'production' },
];

function makeFlag(
  flagId: number,
  key: string,
  envs: Record<number, { enabled: boolean; percentage: number }>,
  overrides: Partial<FlagView> = {},
): FlagView {
  const environments: FlagView['environments'] = {};
  for (const [id, s] of Object.entries(envs)) {
    environments[Number(id)] = {
      enabled: s.enabled,
      percentage: s.percentage,
      segmentIds: [],
      strategyId: null,
      contextDefinitionId: null,
      contextValuesJson: null,
      lastUsedAt: null,
    };
  }
  return {
    key,
    name: key,
    description: '',
    flagType: 'RELEASE',
    tags: [],
    flagId,
    environments,
    archived: false,
    createdAt: null,
    createdBy: null,
    archivedBy: null,
    archivedAt: null,
    ...overrides,
  };
}

describe('computeDrift', () => {
  it('omits flags that are consistent across environments', () => {
    const flag = makeFlag(1, 'consistent', {
      1: { enabled: true, percentage: 100 },
      2: { enabled: true, percentage: 100 },
      3: { enabled: true, percentage: 100 },
    });
    expect(computeDrift([flag], ENVS)).toHaveLength(0);
  });

  it('flags divergence between environments as drift', () => {
    const flag = makeFlag(2, 'diverges', {
      1: { enabled: true, percentage: 100 },
      2: { enabled: true, percentage: 100 },
      3: { enabled: false, percentage: 100 },
    });
    const rows = computeDrift([flag], ENVS);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('drift');
  });

  it('marks partial percentage as rollout status', () => {
    const flag = makeFlag(3, 'rolling', {
      1: { enabled: true, percentage: 100 },
      2: { enabled: true, percentage: 100 },
      3: { enabled: true, percentage: 25 },
    });
    const rows = computeDrift([flag], ENVS);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('rollout');
    const prodCell = rows[0].cells.find((c) => c.environmentId === 3);
    expect(prodCell?.state).toBe('rollout');
    expect(prodCell?.percentage).toBe(25);
  });

  it('treats a missing environment strategy as disabled', () => {
    const flag = makeFlag(4, 'partial', {
      1: { enabled: true, percentage: 100 },
    });
    const rows = computeDrift([flag], ENVS);
    expect(rows).toHaveLength(1);
    const prodCell = rows[0].cells.find((c) => c.environmentId === 3);
    expect(prodCell?.state).toBe('absent');
  });

  it('ignores archived flags', () => {
    const flag = makeFlag(
      5,
      'archived',
      { 1: { enabled: true, percentage: 100 }, 3: { enabled: false, percentage: 100 } },
      { archived: true },
    );
    expect(computeDrift([flag], ENVS)).toHaveLength(0);
  });
});

describe('formatCompactCount', () => {
  it('formats large numbers compactly', () => {
    expect(formatCompactCount(950)).toBe('950');
    expect(formatCompactCount(1500)).toBe('1.5K');
    expect(formatCompactCount(1_240_000)).toBe('1.2M');
  });
});
