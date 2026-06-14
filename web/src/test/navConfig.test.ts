import { describe, it, expect } from 'vitest';
import { MANAGEMENT_ITEMS, ADMIN_ITEMS, type NavItem } from '@/app/components/navConfig';

describe('MANAGEMENT_ITEMS', () => {
  it('has expected items', () => {
    const paths = MANAGEMENT_ITEMS.map(i => i.path);
    expect(paths).toContain('/flags');
    expect(paths).toContain('/segments');
    expect(paths).toContain('/contexts');
    expect(paths).toContain('/tags');
  });

  it('all items have path, labelKey, and icon', () => {
    MANAGEMENT_ITEMS.forEach(item => {
      expect(item.path).toBeTruthy();
      expect(item.labelKey).toBeTruthy();
      expect(item.icon).toBeTruthy();
    });
  });
});

describe('ADMIN_ITEMS', () => {
  it('has expected items', () => {
    const paths = ADMIN_ITEMS.map(i => i.path);
    expect(paths).toContain('/users');
    expect(paths).toContain('/integrations');
    expect(paths).toContain('/settings');
    expect(paths).toContain('/audit');
    expect(paths).toContain('/apikeys');
    expect(paths).toContain('/applications');
  });

  it('all items have path, labelKey, and icon', () => {
    ADMIN_ITEMS.forEach(item => {
      expect(item.path).toBeTruthy();
      expect(item.labelKey).toBeTruthy();
      expect(item.icon).toBeTruthy();
    });
  });

  it('all items have adminOnly: true', () => {
    ADMIN_ITEMS.forEach(item => {
      expect(item.adminOnly).toBe(true);
    });
  });
});
