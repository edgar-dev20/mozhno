import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSegments } from '@/app/hooks/useSegments';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/api', () => ({
  api: {
    segments: {
      list: vi.fn().mockResolvedValue([{ id: 1, name: 'Seg1' }]),
      delete: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({ id: 2 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    contexts: {
      list: vi.fn().mockResolvedValue([{ id: 10, name: 'ctx1' }]),
    },
  },
}));

vi.mock('@/app/hooks/queries/useProjectQuery', () => ({
  useProjectQuery: () => ({ data: { id: 1 } }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useSegments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns segments and contexts', async () => {
    const { result } = renderHook(() => useSegments(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.segments).toEqual([{ id: 1, name: 'Seg1' }]);
    expect(result.current.contexts).toEqual([{ id: 10, name: 'ctx1' }]);
    expect(result.current.projectId).toBe(1);
  });
});
