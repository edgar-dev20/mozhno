import { request } from '@/api/modules/http';
import { Integration, IntegrationRequest } from '@/api/modules/types';

export const integrationsApi = {
  list: () => request<Integration[]>('/integrations'),
  create: (data: IntegrationRequest) =>
    request<Integration>('/integrations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: IntegrationRequest) =>
    request<Integration>(`/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<void>(`/integrations/${id}`, { method: 'DELETE' }),
  webhookLimit: () => request<{ remaining: number }>('/integrations/webhook-limit'),
};
