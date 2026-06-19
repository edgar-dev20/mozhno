import { request } from '@/api/modules/http';
import { ContextDefinition, ContextValue } from '@/api/modules/types';

export const contextsApi = {
  list: () => request<ContextDefinition[]>('/contexts'),
  create: (data: { name: string; key: string; type?: string; description?: string; isStrict?: boolean }) =>
    request<ContextDefinition>('/contexts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; key: string; type?: string; description?: string; isStrict?: boolean }) =>
    request<ContextDefinition>(`/contexts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<void>(`/contexts/${id}`, { method: 'DELETE' }),
  values: {
    list: (defId: number) => request<ContextValue[]>(`/contexts/${defId}/values`),
    create: (defId: number, values: string) =>
      request<ContextValue>(`/contexts/${defId}/values`, {
        method: 'POST',
        body: JSON.stringify({ contextDefinitionId: defId, values }),
      }),
    upsert: (defId: number, values: string) =>
      request<void>(`/contexts/${defId}/values`, {
        method: 'PUT',
        body: JSON.stringify({ contextDefinitionId: defId, values }),
      }),
  },
};
