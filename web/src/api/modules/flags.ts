import { request } from '@/api/modules/http';
import {
  FlagResponse,
  FlagRequest,
  FlagStrategy,
  StrategyRequest,
  FlagMetric,
  PaginatedDashboardResponse,
} from '@/api/modules/types';

export const flagsApi = {
  list: (envId?: number, includeArchived?: boolean) =>
    request<FlagResponse[]>(
      `/flags${envId ? `?environmentId=${envId}` : includeArchived ? '?includeArchived=true' : ''}${envId && includeArchived ? '&includeArchived=true' : ''}`,
    ),
  get: (id: number) => request<FlagResponse>(`/flags/${id}`),
  create: (data: FlagRequest) =>
    request<FlagResponse>('/flags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: FlagRequest) =>
    request<FlagResponse>(`/flags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<void>(`/flags/${id}`, { method: 'DELETE' }),
  archive: (id: number) => request<FlagResponse>(`/flags/${id}/archive`, { method: 'POST' }),
  unarchive: (id: number) => request<FlagResponse>(`/flags/${id}/unarchive`, { method: 'POST' }),
  listEnriched: (page = 0, size = 200) =>
    request<PaginatedDashboardResponse>(`/flags/enriched?page=${page}&size=${size}`),
};

export const strategiesApi = {
  list: (flagId: number) => request<FlagStrategy[]>(`/flags/${flagId}/strategies`),
  create: (flagId: number, data: StrategyRequest) =>
    request<FlagStrategy>(`/flags/${flagId}/strategies`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (flagId: number, id: number, data: StrategyRequest) =>
    request<FlagStrategy>(`/flags/${flagId}/strategies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (flagId: number, id: number) =>
    request<void>(`/flags/${flagId}/strategies/${id}`, { method: 'DELETE' }),
  upsert: (flagId: number, data: StrategyRequest) =>
    request<FlagStrategy>(`/flags/${flagId}/strategies`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const metricsApi = {
  get: (
    flagId: number,
    environmentId: number,
    params?: { instanceId?: number; appName?: string },
  ) => {
    let queryString = `?environmentId=${environmentId}`;
    if (params?.instanceId != null) {
      queryString += `&instanceId=${params.instanceId}`;
    } else if (params?.appName != null) {
      queryString += `&appName=${encodeURIComponent(params.appName)}`;
    }
    return request<FlagMetric[]>(`/flags/${flagId}/metrics${queryString}`);
  },
  listForProject: (environmentId?: number) =>
    request<FlagMetric[]>(
      `/metrics${environmentId != null ? `?environmentId=${environmentId}` : ''}`,
    ),
};
