import { describe, it, expect } from 'vitest';
import {
  OVERVIEW_ITEMS,
  MANAGEMENT_ITEMS,
  TEAM_ITEMS,
  SETTINGS_ITEMS,
} from '@/app/components/navConfig';

describe('OVERVIEW_ITEMS', () => {
  it('contains the root overview route', () => {
    const paths = OVERVIEW_ITEMS.map((i) => i.path);
    expect(paths).toContain('/');
  });

  it('root item matches exactly', () => {
    const root = OVERVIEW_ITEMS.find((i) => i.path === '/');
    expect(root?.exact).toBe(true);
  });

  it('is not admin-only', () => {
    OVERVIEW_ITEMS.forEach((item) => {
      expect(item.adminOnly).toBeFalsy();
    });
  });
});

describe('MANAGEMENT_ITEMS', () => {
  it('has expected items', () => {
    const paths = MANAGEMENT_ITEMS.map((i) => i.path);
    expect(paths).toContain('/flags');
    expect(paths).toContain('/segments');
    expect(paths).toContain('/contexts');
    expect(paths).toContain('/tags');
    expect(paths).toContain('/audit');
  });

  it('all items have path, labelKey, and icon and are not admin-only', () => {
    MANAGEMENT_ITEMS.forEach((item) => {
      expect(item.path).toBeTruthy();
      expect(item.labelKey).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(item.adminOnly).toBeFalsy();
    });
  });
});

describe('TEAM_ITEMS', () => {
  it('has expected items', () => {
    const paths = TEAM_ITEMS.map((i) => i.path);
    expect(paths).toContain('/users');
  });

  it('all items are admin-only with path, labelKey, and icon', () => {
    TEAM_ITEMS.forEach((item) => {
      expect(item.path).toBeTruthy();
      expect(item.labelKey).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(item.adminOnly).toBe(true);
    });
  });
});

describe('SETTINGS_ITEMS', () => {
  it('has expected items', () => {
    const paths = SETTINGS_ITEMS.map((i) => i.path);
    expect(paths).toContain('/apikeys');
    expect(paths).toContain('/integrations');
    expect(paths).toContain('/applications');
    expect(paths).toContain('/settings');
  });

  it('all items are admin-only with path, labelKey, and icon', () => {
    SETTINGS_ITEMS.forEach((item) => {
      expect(item.path).toBeTruthy();
      expect(item.labelKey).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(item.adminOnly).toBe(true);
    });
  });
});
