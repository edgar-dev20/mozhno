export type UserDto = { id: number; email: string; name: string; role: string; status: string; avatar: string | null; locale: string; createdAt: string; lastActiveAt: string };
export type UserCreateRequest = { email: string; password: string; name?: string; role: string; locale?: string };
export type UserUpdateRequest = { email?: string; password?: string; name?: string; role?: string; status?: string; locale?: string };
export type UserInviteRequest = { email: string; name?: string; role: string; locale?: string };
export type ApiKey = { id: number; projectId: number; environmentId: number; name: string; description: string; apiKey: string; keyType: string; createdAt: string; lastUsedAt: string };
export type ApiKeyRequest = { name: string; environmentId?: number; description?: string; keyType?: string };
export type AuditEvent = { id: number; projectId: number; userId: number; userName: string; userEmail: string; action: string; resourceType: string; resourceId: number; resourceName: string; details: string; ipAddress: string; createdAt: string };
export type Integration = { id: number; projectId: number; type: string; name: string; enabled: boolean; configJson: string; eventSubscriptionsJson: string; lastError: string | null; createdAt: string; updatedAt: string };
export type IntegrationRequest = { type: string; name: string; enabled: boolean; configJson: string; eventSubscriptionsJson: string };
export type ProjectSettings = { id: number; projectId: number; requireMfa: boolean; sessionTimeoutHours: number; ipWhitelist: string; accentColor: string | null; createdAt: string; updatedAt: string };
export type SettingsUpdateRequest = { requireMfa?: boolean; sessionTimeoutHours?: number; ipWhitelist?: string; accentColor?: string | null };
export type ClientInstance = { id: number; projectId: number; environmentId: number; apiKeyId: number | null; appName: string; instanceId: string; appType: string; sdkVersion: string | null; keyType: string; firstSeenAt: string; lastSeenAt: string };
export type FlagMetric = { id?: number; projectId?: number; flagId: number; environmentId: number; evaluationTrueCount: number; evaluationFalseCount: number; clientInstanceId?: number; timeBucket: string };

export type PaginatedDashboardResponse = {
  flags: EnrichedFlagResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  segments: SegmentResponse[];
  tags: Tag[];
  contexts: ContextDefinition[];
  environments: Environment[];
};

export type DashboardResponse = {
  flags: EnrichedFlagResponse[];
  segments: SegmentResponse[];
  tags: Tag[];
  contexts: ContextDefinition[];
  environments: Environment[];
};

export type EnrichedFlagResponse = {
  id: number; projectId: number; name: string; key: string; description: string;
  flagType: string; createdAt: string; createdBy: string | null;
  lastUsedAt: string | null; archivedBy: string | null; archivedAt: string | null;
  tags: FlagTagValue[]; archived: boolean;
  environments: {
    environmentId: number; environmentName: string; enabled: boolean;
    percentage: number; segmentIds: number[]; strategyId: number;
    contextDefinitionId: number | null; contextValuesJson: string | null;
    lastUsedAt: string | null;
  }[];
};
