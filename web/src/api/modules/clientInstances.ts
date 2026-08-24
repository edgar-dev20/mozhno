import { request } from '@/api/modules/http';
import { ClientInstance, ClientInstanceUsage } from '@/api/modules/types';

export const clientInstancesApi = {
  list: (environmentId?: number) =>
    request<ClientInstance[]>(
      `/projects/client-instances${environmentId != null ? `?environmentId=${environmentId}` : ''}`,
    ),
  usage: (appName: string, environmentId: number, hours: number) =>
    request<ClientInstanceUsage>(
      `/projects/client-instances/usage?appName=${encodeURIComponent(appName)}&environmentId=${environmentId}&hours=${hours}`,
    ),
};
