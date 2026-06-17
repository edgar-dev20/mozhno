import { request, uploadRequest } from '@/api/modules/http';
import { Project } from '@/api/modules/types';

export const projectsApi = {
  list: () => request<Project[]>('/projects'),
  get: (id: number) => request<Project>(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; description?: string }) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  uploadLogo: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest<Project>(`/projects/${id}/logo`, formData);
  },
  getLogoUrl: (id: number) => `/api/v1/projects/${id}/logo`,
};
