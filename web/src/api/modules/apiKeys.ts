import { request } from "@/api/modules/http";
import { ApiKey, ApiKeyRequest } from "@/api/modules/types";

export const apiKeysApi = {
  list: () => request<ApiKey[]>('/api-keys'),
  create: (data: ApiKeyRequest) =>
    request<ApiKey>('/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ApiKeyRequest) =>
    request<ApiKey>(`/api-keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api-keys/${id}`, { method: 'DELETE' }),
};
