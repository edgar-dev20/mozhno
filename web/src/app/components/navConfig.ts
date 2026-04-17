import { Flag, Users, Box, Tag, UserCog, Webhook, Settings, Activity, Key, Monitor } from '@/shared/icons';

export interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean;
}

export const MANAGEMENT_ITEMS: NavItem[] = [
  { path: '/flags', labelKey: 'navigation.flags', icon: Flag },
  { path: '/segments', labelKey: 'navigation.segments', icon: Users },
  { path: '/contexts', labelKey: 'navigation.contexts', icon: Box },
  { path: '/tags', labelKey: 'navigation.tags', icon: Tag },
];

export const ADMIN_ITEMS: NavItem[] = [
  { path: '/users', labelKey: 'navigation.users', icon: UserCog, adminOnly: true },
  { path: '/integrations', labelKey: 'navigation.integrations', icon: Webhook, adminOnly: true },
  { path: '/settings', labelKey: 'navigation.settings', icon: Settings, adminOnly: true },
  { path: '/audit', labelKey: 'navigation.audit', icon: Activity, adminOnly: true },
  { path: '/apikeys', labelKey: 'navigation.apiKeys', icon: Key, adminOnly: true },
  { path: '/applications', labelKey: 'navigation.applications', icon: Monitor, adminOnly: true },
];
