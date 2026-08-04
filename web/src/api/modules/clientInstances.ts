import { request } from '@/api/modules/http';
import { ClientInstance } from '@/api/modules/types';

export const clientInstancesApi = {
  list: (environmentId?: number) =>
    request<ClientInstance[]>(
      `/projects/client-instances${environmentId != null ? `?environmentId=${environmentId}` : ''}`,
    ),
};
