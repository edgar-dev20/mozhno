import { request } from '@/api/modules/http';
import { AuditEvent } from '@/api/modules/types';

export const auditApi = {
  list: (page?: number, size?: number, dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.set('page', String(page));
    if (size !== undefined) params.set('size', String(size));
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const qs = params.toString();
    return request<AuditEvent[]>(`/audit${qs ? `?${qs}` : ''}`);
  },
};
