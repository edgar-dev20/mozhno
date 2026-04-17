import { request } from "@/api/modules/http";
import { SegmentResponse, SegmentRequest } from "@/api/modules/types";

export const segmentsApi = {
  list: () => request<SegmentResponse[]>('/segments'),
  get: (id: number) => request<SegmentResponse>(`/segments/${id}`),
  create: (data: SegmentRequest) =>
    request<SegmentResponse>('/segments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: SegmentRequest) =>
    request<SegmentResponse>(`/segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/segments/${id}`, { method: 'DELETE' }),
};
