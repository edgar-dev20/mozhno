import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlagPanels } from '@/app/hooks/useFlagPanels';
import type { FlagView } from '@/app/hooks/flagTypes';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

function makeFlag(overrides: Partial<FlagView> = {}): FlagView {
  return {
    flagId: 1,
    name: 'Test',
    key: 'test',
    flagType: 'RELEASE',
    enabled: true,
    archived: false,
    createdAt: '2024-01-01T00:00:00Z',
    tags: [],
    environments: {},
    ...overrides,
  } as FlagView;
}

function makeMocks() {
  return {
    deleteFlag: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
    archiveFlag: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
    unarchiveFlag: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
    toggleFlagMutation: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
  };
}

describe('useFlagPanels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens create panel', () => {
    const mocks = makeMocks();
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    act(() => {
      result.current.openCreate();
    });
    expect(result.current.panelOpen).toBe(true);
    expect(result.current.editing.mode).toBe('create');
  });

  it('opens general panel', () => {
    const mocks = makeMocks();
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    act(() => {
      result.current.openGeneral(makeFlag());
    });
    expect(result.current.panelOpen).toBe(true);
    expect(result.current.editing.mode).toBe('general');
  });

  it('opens environment panel', () => {
    const mocks = makeMocks();
    const flag = makeFlag({
      environments: {
        1: {
          enabled: true,
          percentage: 50,
          segmentIds: [1],
          strategyId: null,
          contextDefinitionId: null,
          contextValuesJson: null,
          lastUsedAt: null,
        },
      },
    });
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    act(() => {
      result.current.openEnvironment(flag, 1);
    });
    expect(result.current.editing.mode).toBe('environment');
    expect(result.current.envRulePercent).toBe(50);
    expect(result.current.envRuleEnabled).toBe(true);
  });

  it('detects env dirty state', () => {
    const mocks = makeMocks();
    const flag = makeFlag({
      environments: {
        1: {
          enabled: false,
          percentage: 100,
          segmentIds: [],
          strategyId: null,
          contextDefinitionId: null,
          contextValuesJson: null,
          lastUsedAt: null,
        },
      },
    });
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    act(() => {
      result.current.openEnvironment(flag, 1);
    });
    expect(result.current.isEnvDirty).toBe(false);
    act(() => {
      result.current.setEnvRulePercent(50);
    });
    expect(result.current.isEnvDirty).toBe(true);
  });

  it('doDelete calls mutateAsync', async () => {
    const mocks = makeMocks();
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    act(() => {
      result.current.setDeleteTarget(makeFlag());
    });
    await act(() => result.current.doDelete());
    expect(mocks.deleteFlag.mutateAsync).toHaveBeenCalledWith(1);
    expect(result.current.deleteTarget).toBeNull();
  });

  it('doArchive calls mutateAsync', async () => {
    const mocks = makeMocks();
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    act(() => {
      result.current.setArchiveTarget(makeFlag());
    });
    await act(() => result.current.doArchive());
    expect(mocks.archiveFlag.mutateAsync).toHaveBeenCalledWith(1);
  });

  it('doUnarchive calls mutateAsync', async () => {
    const mocks = makeMocks();
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    await act(() => result.current.doUnarchive(makeFlag()));
    expect(mocks.unarchiveFlag.mutateAsync).toHaveBeenCalledWith(1);
  });

  it('doToggleFlag toggles enabled state', async () => {
    const mocks = makeMocks();
    const flag = makeFlag({
      environments: {
        1: {
          enabled: false,
          percentage: 100,
          segmentIds: [],
          strategyId: null,
          contextDefinitionId: null,
          contextValuesJson: null,
          lastUsedAt: null,
        },
      },
    });
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    await act(() => result.current.doToggleFlag(flag, 1));
    expect(mocks.toggleFlagMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });

  it('resetPanel closes panel', () => {
    const mocks = makeMocks();
    const { result } = renderHook(() =>
      useFlagPanels(
        1,
        [],
        mocks.deleteFlag,
        mocks.archiveFlag,
        mocks.unarchiveFlag,
        mocks.toggleFlagMutation,
      ),
    );
    act(() => {
      result.current.openCreate();
    });
    act(() => {
      result.current.resetPanel();
    });
    expect(result.current.panelOpen).toBe(false);
  });
});
