import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFlagSave } from '@/app/components/flags/useFlagSave';
import { computeDiff } from '@/shared/diffUtils';
import { api } from '@/api';
import type { ReactNode } from 'react';

vi.mock('@/api', () => ({
  api: {
    flags: {
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    },
    strategies: {
      create: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

const mockEnvironments = [
  { id: 1, name: 'Development' },
  { id: 2, name: 'Production' },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const makeFlag = (overrides: Record<string, unknown> = {}) => ({
  key: 'test',
  name: 'Test Flag',
  description: '',
  flagType: 'RELEASE',
  tags: [] as { tagId: number; tagName: string; tagColor: string; value: string }[],
  flagId: 1,
  environments: { 1: { enabled: true, percentage: 100, segmentIds: [], strategyId: null, contextDefinitionId: null, contextValuesJson: null } },
  archived: false,
  createdAt: null as string | null,
  createdBy: null as string | null,
  archivedBy: null as string | null,
  archivedAt: null as string | null,
  ...overrides,
});

describe('useFlagSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(
      () => useFlagSave({ projectId: 1, environments: mockEnvironments }),
      { wrapper: createWrapper() },
    );
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.diffOpen).toBe(false);
  });

  it('save in create mode calls flags.create and strategies.create', async () => {
    vi.mocked(api.flags.create).mockResolvedValue({ id: 10 } as never);
    vi.mocked(api.strategies.create).mockResolvedValue({} as never);

    const { result } = renderHook(
      () => useFlagSave({ projectId: 1, environments: mockEnvironments }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      result.current.save({
        mode: 'create',
        data: { name: 'Test', key: 'test-key', description: '', flagType: 'RELEASE', tags: [] },
      });
    });

    expect(api.flags.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test', key: 'test-key', description: '', flagType: 'RELEASE', tags: undefined }));
  });

  it('save in general mode shows diff when name changes', () => {
    const flag = makeFlag({ name: 'Old Name' });

    const { result } = renderHook(
      () => useFlagSave({ projectId: 1, environments: mockEnvironments }),
      { wrapper: createWrapper() },
    );

    const before: Record<string, unknown> = {
      name: flag.name,
      key: flag.key,
      description: flag.description,
      flagType: flag.flagType,
      tags: '—',
    };
    const after: Record<string, unknown> = {
      name: 'New Name',
      key: 'test',
      description: '',
      flagType: 'RELEASE',
      tags: '—',
    };
    const changes = computeDiff(before, after, { name: 'Название', key: 'Ключ', description: 'Описание', flagType: 'Тип', tags: 'Теги' });

    act(() => {
      result.current.showDiff(changes, {
        mode: 'general',
        data: { flag, name: 'New Name', key: 'test', description: '', flagType: 'RELEASE', tags: [] },
      });
    });

    expect(result.current.diffOpen).toBe(true);
    expect(changes.length).toBeGreaterThan(0);
  });

  it('closeDiff closes the diff dialog', () => {
    const { result } = renderHook(
      () => useFlagSave({ projectId: 1, environments: mockEnvironments }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.showDiff([{ field: 'name', label: 'Название', before: 'Old', after: 'New' }], {
        mode: 'general',
        data: { flag: makeFlag(), name: 'New', key: 'test', description: '', flagType: 'RELEASE', tags: [] },
      });
    });

    expect(result.current.diffOpen).toBe(true);

    act(() => {
      result.current.closeDiff();
    });

    expect(result.current.diffOpen).toBe(false);
  });

  it('handles API error in create mode', async () => {
    vi.mocked(api.flags.create).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(
      () => useFlagSave({ projectId: 1, environments: mockEnvironments }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      result.current.save({
        mode: 'create',
        data: { name: 'Test', key: 'test-key', description: '', flagType: 'RELEASE', tags: [] },
      });
    });

    expect(result.current.error).toBe('API Error');
  });
});
