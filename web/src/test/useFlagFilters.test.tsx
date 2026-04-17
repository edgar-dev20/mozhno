import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlagFilters } from "@/app/hooks/useFlagFilters";
import type { FlagView } from "@/app/hooks/flagTypes";

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
    makeFlag({ flagId: 1, name: 'Alpha', key: 'alpha', flagType: 'RELEASE', createdAt: '2024-01-10T00:00:00Z' }),
    makeFlag({ flagId: 2, name: 'Beta', key: 'beta', flagType: 'KILLSWITCH', createdAt: '2024-01-20T00:00:00Z' }),
    makeFlag({ flagId: 3, name: 'Gamma', key: 'gamma', flagType: 'RELEASE', createdAt: '2024-01-15T00:00:00Z', archived: true }),
    makeFlag({ flagId: 4, name: 'Delta', key: 'delta', flagType: 'RELEASE', createdAt: '2024-01-05T00:00:00Z', createdBy: 'admin' }),
    makeFlag({ flagId: 5, name: 'Alpha Pro', key: 'alpha-pro', flagType: 'RELEASE', createdAt: '2024-02-01T00:00:00Z', tags: [{ tagId: 10, tagName: 'team', tagColor: '#f00', value: 'backend' }] }),
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
    act(() => { result.current.setFlagTypeFilter('KILLSWITCH'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].key).toBe('beta');
  });

  it('filters by search query', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => { result.current.setSearchQuery('alpha'); });
    expect(result.current.filtered).toHaveLength(2);
  });

  it('filters by search query on createdBy', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => { result.current.setSearchQuery('admin'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe('Delta');
  });

  it('sorts by date', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => { result.current.setSortBy('createdAt'); });
    expect(result.current.filtered[0].key).toBe('alpha-pro');
  });

  it('filters by tag', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    act(() => { result.current.setSelectedTagTypeFilter(10); });
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
    act(() => { result.current.setSearchQuery('x'); });
    expect(result.current.displayLimit).toBe(10);
  });

  it('uniqueTagValues returns sorted unique values', () => {
    const { result } = renderHook(() => useFlagFilters(flags));
    const vals = result.current.uniqueTagValues(10);
    expect(vals).toEqual(['backend']);
  });
});
