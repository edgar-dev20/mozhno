import { request } from '@/api/modules/http';
import { OverviewResponse } from '@/api/modules/types';

export const overviewApi = {
  get: () => request<OverviewResponse>('/overview'),
};
