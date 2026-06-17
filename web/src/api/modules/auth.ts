import { request, getRefreshToken } from "@/api/modules/http";
import { UserDto } from "@/api/modules/types";

export const authApi = {
  login: (email: string, password: string, rememberMe: boolean = false) =>
    request<{ token: string; refreshToken: string; user: UserDto }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    }),
  me: () => request<UserDto>('/auth/me'),
  refresh: () => {
    const rt = getRefreshToken();
    return request<{ token: string; refreshToken: string; user: UserDto }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: rt }),
    });
  },
  logout: () => {
    const rt = getRefreshToken();
    return request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: rt }),
    });
  },
  forgotPassword: (email: string, locale?: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, locale }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  acceptInvite: (token: string, name: string, password: string) =>
    request<UserDto>('/auth/accept-invite', {
      method: 'POST',
      body: JSON.stringify({ token, name, password }),
    }),
  selectProject: (projectId: number) =>
    request<{ token: string; refreshToken: string; user: UserDto }>('/auth/select-project', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),
};
