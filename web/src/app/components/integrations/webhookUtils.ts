import type { MessageKey } from '@/i18n';
import type { Integration } from '@/api';

export const ALL_EVENTS = [
  'flag.created',
  'flag.updated',
  'flag.deleted',
  'flag.archived',
  'flag.unarchived',
  'strategy.created',
  'strategy.updated',
  'environment.created',
  'environment.updated',
  'environment.deleted',
  'project.created',
  'project.updated',
  'project.deleted',
  'project.logo_updated',
  'user.created',
  'user.updated',
  'user.deleted',
  'segment.created',
  'segment.updated',
  'segment.deleted',
  'tag.created',
  'tag.updated',
  'tag.deleted',
  'apikey.created',
  'apikey.updated',
  'apikey.deleted',
  'context_definition.created',
  'context_definition.updated',
  'context_definition.deleted',
  'context_value.created',
  'context_value.updated',
  'context_value.deleted',
];

export const EVENT_CATEGORY_KEYS = [
  'flags',
  'strategies',
  'environments',
  'projects',
  'users',
  'segments',
  'tags',
  'apiKeys',
  'contexts',
] as const;

export type EventCategoryKey = (typeof EVENT_CATEGORY_KEYS)[number];

export const CATEGORY_EVENT_MAP: Record<EventCategoryKey, string[]> = {
  flags: ['flag.created', 'flag.updated', 'flag.deleted', 'flag.archived', 'flag.unarchived'],
  strategies: ['strategy.created', 'strategy.updated'],
  environments: ['environment.created', 'environment.updated', 'environment.deleted'],
  projects: ['project.created', 'project.updated', 'project.deleted', 'project.logo_updated'],
  users: ['user.created', 'user.updated', 'user.deleted'],
  segments: ['segment.created', 'segment.updated', 'segment.deleted'],
  tags: ['tag.created', 'tag.updated', 'tag.deleted'],
  apiKeys: ['apikey.created', 'apikey.updated', 'apikey.deleted'],
  contexts: [
    'context_definition.created',
    'context_definition.updated',
    'context_definition.deleted',
    'context_value.created',
    'context_value.updated',
    'context_value.deleted',
  ],
};

export const OLD_EVENT_KEY_MAP: Record<string, string> = {
  flagCreated: 'flag.created',
  flagUpdated: 'flag.updated',
  flagDeleted: 'flag.deleted',
  userInvited: 'user.created',
};

export const TEMPLATE_VAR_KEYS = [
  'events.action',
  'events.resourceType',
  'events.resourceId',
  'events.resourceName',
  'events.details',
  'events.projectId',
  'events.user.id',
  'events.user.name',
  'events.user.email',
  'events.timestamp',
] as const;

export const STANDARD_HEADERS = [
  'Content-Type',
  'Authorization',
  'Accept',
  'User-Agent',
  'X-API-Key',
  'X-Signature',
  'X-Request-ID',
  'Cache-Control',
  'Cookie',
  'Referer',
];

export interface HeaderRow {
  id: number;
  key: string;
  value: string;
}

export interface WebhookConfig {
  url: string;
  headers: Record<string, string>;
  body: string;
}

export function categoryI18nKey(catKey: EventCategoryKey): MessageKey {
  return `integrations.eventCategories.${catKey}` as MessageKey;
}

export function migrateEventKeys(events: string[]): string[] {
  return events.map((k) => OLD_EVENT_KEY_MAP[k] || k).filter((k) => ALL_EVENTS.includes(k));
}

export function parseWebhookConfig(integration: Integration): WebhookConfig {
  try {
    const cfg = JSON.parse(integration.configJson || '{}');
    return {
      url: cfg.url || '',
      headers: cfg.headers || {},
      body: cfg.body || '',
    };
  } catch {
    return { url: '', headers: {}, body: '' };
  }
}

export function parseEvents(integration: Integration): string[] {
  try {
    return JSON.parse(integration.eventSubscriptionsJson || '[]');
  } catch {
    return [];
  }
}

export function buildHeadersMap(headers: HeaderRow[]): Record<string, string> {
  const h: Record<string, string> = {};
  for (const r of headers) {
    if (r.key.trim()) h[r.key.trim()] = r.value;
  }
  return h;
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: false, error: 'integrations.urlRequired' as string };
  }
  if (!url.startsWith('https://')) {
    return { valid: false, error: 'integrations.urlMustBeHttps' as string };
  }
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'integrations.urlInvalid' as string };
  }
}

export function isValidJson(str: string): boolean {
  if (!str.trim()) return true;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function isJsonContentType(headers: HeaderRow[]): boolean {
  const ct = headers.find((h) => h.key.trim().toLowerCase() === 'content-type');
  if (!ct) return true;
  return ct.value.toLowerCase().includes('application/json');
}

export function buildCurlCommand(url: string, headers: HeaderRow[], body: string): string {
  const hdrLines = headers
    .filter((h) => h.key.trim())
    .map((h) => `-H '${h.key.trim()}: ${h.value}'`)
    .join(' ');
  const hdrsPart = hdrLines ? ` ${hdrLines}` : '';
  const bodyPart = body.trim() ? ` -d '${body.replace(/'/g, "'\\''")}'` : '';
  return `curl -v -X POST '${url}'${hdrsPart}${bodyPart}`;
}
