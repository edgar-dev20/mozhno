import { request } from '@/api/modules/http';
import { Environment } from '@/api/modules/types';

export const environmentsApi = {
  list: () => request<Environment[]>('/environments'),
  create: (name: string) =>
    request<Environment>('/environments', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  update: (id: number, name: string) =>
    request<Environment>(`/environments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),
  getLimit: () => request<{ maxEnvironments: number }>('/environments/limit'),
  delete: (id: number) => request<void>(`/environments/${id}`, { method: 'DELETE' }),
};
