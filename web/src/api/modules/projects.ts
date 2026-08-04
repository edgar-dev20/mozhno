import { request, uploadRequest } from '@/api/modules/http';
import { Project } from '@/api/modules/types';

export const projectsApi = {
  list: () => request<Project[]>('/projects'),
  update: (data: { name: string; description?: string }) =>
    request<Project>('/projects', { method: 'PUT', body: JSON.stringify(data) }),
  reset: () => request<Project>('/projects/reset', { method: 'POST' }),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest<Project>('/projects/logo', formData);
  },
  getLogoUrl: () => '/api/v1/projects/logo',
};
