import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlagFilters } from '@/app/hooks/useFlagFilters';
import type { FlagView } from '@/app/hooks/flagTypes';

function makeFlag(overrides: Partial<FlagView> = {}): FlagView {
  return {
    flagId: 1,
    name: 'Test Flag',
    key: 'test-flag',
    flagType: 'RELEASE',
    enabled: true,
    archived: false,
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'user1',
    tags: [],
    environments: {},
    ...overrides,
  } as FlagView;
}

describe('useFlagFilters', () => {
  const flags: FlagView[] = [
    makeFlag({
      flagId: 1,
      name: 'Alpha',
      key: 'alpha',
      flagType: 'RELEASE',
      createdAt: '2024-01-10T00:00:00Z',
    }),
    makeFlag({
      flagId: 2,
      name: 'Beta',
      key: 'beta',
      flagType: 'KILLSWITCH',
      createdAt: '2024-01-20T00:00:00Z',
    }),
    makeFlag({
      flagId: 3,
      name: 'Gamma',
      key: 'gamma',
      flagType: 'RELEASE',
      createdAt: '2024-01-15T00:00:00Z',
      archived: true,
    }),
    makeFlag({
      flagId: 4,
      name: 'Delta',
      key: 'delta',
      flagType: 'RELEASE',
      createdAt: '2024-01-05T00:00:00Z',
      createdBy: 'admin',
    }),
    makeFlag({
      flagId: 5,
      name: 'Alpha Pro',
      key: 'alpha-pro',
      flagType: 'RELEASE',
      createdAt: '2024-02-01T00:00:00Z',
      tags: [{ tagId: 10, tagName: 'team', tagColor: '#f00', value: 'backend' }],
    }),
  ];

  it('filters out archived flags by default', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    expect(result.current.filtered).toHaveLength(4);
    expect(result.current.archivedFlags).toHaveLength(1);
  });

  it('sorts by name by default', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    expect(result.current.filtered[0].name).toBe('Alpha');
    expect(result.current.filtered[1].name).toBe('Alpha Pro');
  });

  it('limits visible flags', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    expect(result.current.visibleFlags).toHaveLength(4);
    expect(result.current.hasMoreFlags).toBe(false);
  });

  it('filters by flag type', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => {
      result.current.setFlagTypeFilter('KILLSWITCH');
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].key).toBe('beta');
  });

  it('filters by search query', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => {
      result.current.setSearchQuery('alpha');
    });
    expect(result.current.filtered).toHaveLength(2);
  });

  it('filters by search query on createdBy', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => {
      result.current.setSearchQuery('admin');
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe('Delta');
  });

  it('sorts by date', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => {
      result.current.setSortBy('createdAt');
    });
    expect(result.current.filtered[0].key).toBe('alpha-pro');
  });

  it('filters by tag', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => {
      result.current.setSelectedTagTypeFilter(10);
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].key).toBe('alpha-pro');
  });

  it('filters by date range', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => {
      result.current.setDateFrom('2024-01-15');
      result.current.setDateTo('2024-01-31');
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].key).toBe('beta');
  });

  it('reset display limit on filter change', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => {
      result.current.setSearchQuery('x');
    });
    expect(result.current.displayLimit).toBe(10);
  });

  it('uniqueTagValues returns sorted unique values', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    const vals = result.current.uniqueTagValues(10);
    expect(vals).toEqual(['backend']);
  });
});

describe('useFlagFilters stale filter', () => {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  function envFlag(id: number, createdAt: string | null, lastUsedAt: string | null): FlagView {
    return makeFlag({
      flagId: id,
      name: `F${id}`,
      key: `f${id}`,
      createdAt,
      environments: {
        1: {
          enabled: false,
          percentage: 0,
          segmentIds: [],
          strategyId: 1,
          contextDefinitionId: null,
          contextValuesJson: null,
          lastUsedAt,
        },
      },
    });
  }

  it('excludes flags created within the stale window', () => {
    const fresh = envFlag(1, new Date(now - 2 * DAY).toISOString(), null);
    const old = envFlag(2, new Date(now - 90 * DAY).toISOString(), null);

    const { result } = renderHook(() => useFlagFilters([fresh, old]));
    act(() => result.current.setStaleFilter(true));

    expect(result.current.filtered.map((f) => f.flagId)).toEqual([2]);
  });

  it('excludes old flags evaluated recently', () => {
    const used = envFlag(1, new Date(now - 90 * DAY).toISOString(), new Date(now - 2 * DAY).toISOString());

    const { result } = renderHook(() => useFlagFilters([used]));
    act(() => result.current.setStaleFilter(true));

    expect(result.current.filtered).toHaveLength(0);
  });

  it('includes old flags never evaluated', () => {
    const unused = envFlag(1, new Date(now - 90 * DAY).toISOString(), null);

    const { result } = renderHook(() => useFlagFilters([unused]));
    act(() => result.current.setStaleFilter(true));

    expect(result.current.filtered.map((f) => f.flagId)).toEqual([1]);
  });

  it('includes flags without createdAt when never evaluated', () => {
    const noCreatedAt = envFlag(1, null, null);

    const { result } = renderHook(() => useFlagFilters([noCreatedAt]));
    act(() => result.current.setStaleFilter(true));

    expect(result.current.filtered.map((f) => f.flagId)).toEqual([1]);
  });

  it('excludes fresh flags without environments and includes old ones', () => {
    const fresh = makeFlag({
      flagId: 1,
      name: 'Fresh',
      key: 'fresh',
      createdAt: new Date(now - 2 * DAY).toISOString(),
    });
    const old = makeFlag({
      flagId: 2,
      name: 'Old',
      key: 'old',
      createdAt: new Date(now - 90 * DAY).toISOString(),
    });

    const { result } = renderHook(() => useFlagFilters([fresh, old]));
    act(() => result.current.setStaleFilter(true));

    expect(result.current.filtered.map((f) => f.flagId)).toEqual([2]);
  });
});
