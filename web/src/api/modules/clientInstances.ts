import { request } from '@/api/modules/http';
import { ClientInstance } from '@/api/modules/types';

export const clientInstancesApi = {
  list: (projectId: number, environmentId?: number) =>
    request<ClientInstance[]>(
      `/projects/${projectId}/client-instances${environmentId != null ? `?environmentId=${environmentId}` : ''}`,
    ),
};
