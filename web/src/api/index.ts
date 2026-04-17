export {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearAuth,
  setOnAuthExpired,
} from "@/api/modules/http";

import { authApi } from "@/api/modules/auth";
import { projectsApi } from "@/api/modules/projects";
import { environmentsApi } from "@/api/modules/environments";
import { flagsApi, strategiesApi, metricsApi } from "@/api/modules/flags";
import { segmentsApi } from "@/api/modules/segments";
import { tagsApi } from "@/api/modules/tags";
import { contextsApi } from "@/api/modules/contexts";
import { usersApi } from "@/api/modules/users";
import { apiKeysApi } from "@/api/modules/apiKeys";
import { clientInstancesApi } from "@/api/modules/clientInstances";
import { auditApi } from "@/api/modules/audit";
import { integrationsApi } from "@/api/modules/integrations";
import { settingsApi } from "@/api/modules/settings";

export const api = {
  auth: authApi,
  projects: projectsApi,
  environments: environmentsApi,
  flags: flagsApi,
  strategies: strategiesApi,
  metrics: metricsApi,
  segments: segmentsApi,
  tags: tagsApi,
  contexts: contextsApi,
  users: usersApi,
  apiKeys: apiKeysApi,
  clientInstances: clientInstancesApi,
  audit: auditApi,
  integrations: integrationsApi,
  settings: settingsApi,
};

export type {
  UserDto,
  Project,
  Environment,
  FlagResponse,
  FlagTagValue,
  FlagRequest,
  FlagStrategy,
  StrategyRequest,
  FlagMetric,
  SegmentResponse,
  SegmentRequest,
  Tag,
  TagRequest,
  ContextDefinition,
  ContextValue,
  UserCreateRequest,
  UserUpdateRequest,
  ApiKey,
  ApiKeyRequest,
  AuditEvent,
  Integration,
  IntegrationRequest,
  ProjectSettings,
  SettingsUpdateRequest,
  ClientInstance,
  EnrichedFlagResponse,
  DashboardResponse,
} from "@/api/modules/types";
