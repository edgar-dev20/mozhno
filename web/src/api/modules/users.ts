import { uploadRequest, request } from '@/api/modules/http';
import {
  UserDto,
  UserCreateRequest,
  UserUpdateRequest,
  UserInviteRequest,
} from '@/api/modules/types';

export const usersApi = {
  list: () => request<UserDto[]>('/users'),
  get: (id: number) => request<UserDto>(`/users/${id}`),
  create: (data: UserCreateRequest) =>
    request<UserDto>('/users', { method: 'POST', body: JSON.stringify(data) }),
  invite: (data: UserInviteRequest) =>
    request<{ message: string }>('/users/invite', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UserUpdateRequest) =>
    request<UserDto>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  uploadAvatar: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest<UserDto>(`/users/${id}/avatar`, formData);
  },
  sendResetLink: (id: number) =>
    request<{ message: string }>(`/users/${id}/send-reset-link`, { method: 'POST' }),
  getAvatarUrl: (id: number) => `/api/v1/users/${id}/avatar`,
};
