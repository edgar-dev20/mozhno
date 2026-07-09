import { request } from '@/api/modules/http';
import { Environment, EnvironmentRequest } from '@/api/modules/types';

export const environmentsApi = {
  list: () => request<Environment[]>('/environments'),
  create: (data: EnvironmentRequest) =>
    request<Environment>('/environments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: EnvironmentRequest) =>
    request<Environment>(`/environments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getLimit: () => request<{ maxEnvironments: number }>('/environments/limit'),
  delete: (id: number) => request<void>(`/environments/${id}`, { method: 'DELETE' }),
};
