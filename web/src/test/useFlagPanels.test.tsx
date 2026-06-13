import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFlagPanels } from '@/app/hooks/useFlagPanels';
import type { ReactNode } from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockDeleteFlag = { mutateAsync: vi.fn().mockResolvedValue(undefined) };
const mockArchiveFlag = { mutateAsync: vi.fn().mockResolvedValue(undefined) };
const mockUnarchiveFlag = { mutateAsync: vi.fn().mockResolvedValue(undefined) };
const mockToggleFlag = { mutateAsync: vi.fn().mockResolvedValue(undefined) };

describe('useFlagPanels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state with panel closed', () => {
    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    expect(result.current.panelOpen).toBe(false);
    expect(result.current.editing.mode).toBe('create');
    expect(result.current.editing.flag).toBeNull();
    expect(result.current.deleting).toBe(false);
    expect(result.current.archiving).toBe(false);
    expect(result.current.generalDirty).toBe(false);
  });

  it('opens create panel', () => {
    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openCreate();
    });

    expect(result.current.panelOpen).toBe(true);
    expect(result.current.editing.mode).toBe('create');
    expect(result.current.editing.flag).toBeNull();
  });

  it('opens general panel with flag', () => {
    const flag = {
      key: 'test-flag',
      name: 'Test Flag',
      description: '',
      flagType: 'RELEASE',
      tags: [],
      flagId: 1,
      environments: {},
      archived: false,
      createdAt: null,
      createdBy: null,
      archivedBy: null,
      archivedAt: null,
    };

    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openGeneral(flag);
    });

    expect(result.current.panelOpen).toBe(true);
    expect(result.current.editing.mode).toBe('general');
    expect(result.current.editing.flag).toBe(flag);
  });

  it('opens environment panel with envId', () => {
    const flag = {
      key: 'test-flag',
      name: 'Test Flag',
      description: '',
      flagType: 'RELEASE',
      tags: [],
      flagId: 1,
      environments: {},
      archived: false,
      createdAt: null,
      createdBy: null,
      archivedBy: null,
      archivedAt: null,
    };

    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openEnvironment(flag, 1);
    });

    expect(result.current.panelOpen).toBe(true);
    expect(result.current.editing.mode).toBe('environment');
    expect(result.current.editing.envId).toBe(1);
  });

  it('calls delete mutation and closes panel when doDelete is invoked', async () => {
    const deleteTarget = {
      key: 'to-delete',
      name: 'Delete Me',
      description: '',
      flagType: 'RELEASE',
      tags: [],
      flagId: 42,
      environments: {},
      archived: false,
      createdAt: null,
      createdBy: null,
      archivedBy: null,
      archivedAt: null,
    };

    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.setDeleteTarget(deleteTarget);
      result.current.setPanelOpen(true);
    });

    await act(async () => {
      await result.current.doDelete();
    });

    expect(mockDeleteFlag.mutateAsync).toHaveBeenCalledWith(42);
    expect(result.current.deleteTarget).toBeNull();
    expect(result.current.panelOpen).toBe(false);
  });

  it('calls toggle mutation with correct args', async () => {
    const flag = {
      key: 'toggle-me',
      name: 'Toggle Me',
      description: '',
      flagType: 'RELEASE',
      tags: [],
      flagId: 7,
      environments: {
        1: {
          enabled: false,
          percentage: 50,
          segmentIds: [1, 2],
          strategyId: 10,
          contextDefinitionId: 3,
          contextValuesJson: '{}',
          lastUsedAt: null,
        },
      },
      archived: false,
      createdAt: null,
      createdBy: null,
      archivedBy: null,
      archivedAt: null,
    };

    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.doToggleFlag(flag, 1);
    });

    expect(mockToggleFlag.mutateAsync).toHaveBeenCalledWith({
      flagId: 7,
      envId: 1,
      enabled: true,
      percentage: 50,
      segmentIds: [1, 2],
      contextDefinitionId: 3,
      contextValuesJson: '{}',
    });
  });

  it('resets panel state when resetPanel is called', () => {
    const flag = {
      key: 'test',
      name: 'Test',
      description: '',
      flagType: 'RELEASE',
      tags: [],
      flagId: 1,
      environments: {},
      archived: false,
      createdAt: null,
      createdBy: null,
      archivedBy: null,
      archivedAt: null,
    };

    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openGeneral(flag);
    });

    expect(result.current.panelOpen).toBe(true);

    act(() => {
      result.current.resetPanel();
    });

    expect(result.current.panelOpen).toBe(false);
    expect(result.current.editing.flag).toBeNull();
  });

  it('exposes generalDirty and allows setting it', () => {
    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    expect(result.current.generalDirty).toBe(false);

    act(() => {
      result.current.setGeneralDirty(true);
    });

    expect(result.current.generalDirty).toBe(true);
  });

  it('resets generalDirty when opening a new panel', () => {
    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.setGeneralDirty(true);
    });
    expect(result.current.generalDirty).toBe(true);

    act(() => {
      result.current.openGeneral({
        key: 'test', name: 'Test', description: '', flagType: 'RELEASE', tags: [],
        flagId: 1, environments: {}, archived: false,
        createdAt: null, createdBy: null, archivedBy: null, archivedAt: null,
      });
    });
    expect(result.current.generalDirty).toBe(false);
  });

  it('resets generalDirty when resetPanel is called', () => {
    const { result } = renderHook(
      () =>
        useFlagPanels(1, [], mockDeleteFlag, mockArchiveFlag, mockUnarchiveFlag, mockToggleFlag),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.setGeneralDirty(true);
    });
    expect(result.current.generalDirty).toBe(true);

    act(() => {
      result.current.resetPanel();
    });
    expect(result.current.generalDirty).toBe(false);
  });
});
