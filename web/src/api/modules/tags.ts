import { request } from "@/api/modules/http";
import { Tag, TagRequest } from "@/api/modules/types";

export const tagsApi = {
  list: () => request<Tag[]>('/tags'),
  get: (id: number) => request<Tag>(`/tags/${id}`),
  create: (data: TagRequest) =>
    request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: TagRequest) =>
    request<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/tags/${id}`, { method: 'DELETE' }),
};
