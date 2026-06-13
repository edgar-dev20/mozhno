import { request } from "@/api/modules/http";
import { ProjectSettings, SettingsUpdateRequest } from "@/api/modules/types";

export const settingsApi = {
  get: () => request<ProjectSettings>('/settings'),
  update: (data: SettingsUpdateRequest) =>
    request<ProjectSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
