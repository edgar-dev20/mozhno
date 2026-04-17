import { uploadRequest, request } from "@/api/modules/http";
import { UserDto, UserCreateRequest, UserUpdateRequest } from "@/api/modules/types";

export const usersApi = {
  list: () => request<UserDto[]>('/users'),
  get: (id: number) => request<UserDto>(`/users/${id}`),
  create: (data: UserCreateRequest) =>
    request<UserDto>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UserUpdateRequest) =>
    request<UserDto>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  uploadAvatar: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest<UserDto>(`/users/${id}/avatar`, formData);
  },
  getAvatarUrl: (id: number) => `/api/v1/users/${id}/avatar`,
};
