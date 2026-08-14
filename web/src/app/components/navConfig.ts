import {
  Flag,
  Users,
  Box,
  Tag,
  UserCog,
  Webhook,
  Settings,
  Activity,
  Key,
  Monitor,
  Home,
} from '@/shared/icons';

export interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean;
  /** Match only on exact pathname equality instead of prefix (used for the root route). */
  exact?: boolean;
}

export const OVERVIEW_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'navigation.overview', icon: Home, exact: true },
];

export const MANAGEMENT_ITEMS: NavItem[] = [
  { path: '/flags', labelKey: 'navigation.flags', icon: Flag },
  { path: '/segments', labelKey: 'navigation.segments', icon: Users },
  { path: '/contexts', labelKey: 'navigation.contexts', icon: Box },
  { path: '/tags', labelKey: 'navigation.tags', icon: Tag },
  { path: '/audit', labelKey: 'navigation.audit', icon: Activity },
];

export const TEAM_ITEMS: NavItem[] = [
  { path: '/users', labelKey: 'navigation.users', icon: UserCog, adminOnly: true },
];

export const SETTINGS_ITEMS: NavItem[] = [
  { path: '/apikeys', labelKey: 'navigation.apiKeys', icon: Key, adminOnly: true },
  { path: '/integrations', labelKey: 'navigation.integrations', icon: Webhook, adminOnly: true },
  { path: '/applications', labelKey: 'navigation.applications', icon: Monitor, adminOnly: true },
  { path: '/settings', labelKey: 'navigation.settings', icon: Settings, adminOnly: true },
];
