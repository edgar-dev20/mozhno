import { describe, it, expect } from 'vitest';
import { en } from '@/i18n/locales/en';
import { ru } from '@/i18n/locales/ru';

function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('i18n locale parity', () => {
  it('en and ru expose an identical set of translation keys', () => {
    const enKeys = keyPaths(en).sort();
    const ruKeys = keyPaths(ru).sort();

    const missingInEn = ruKeys.filter((k) => !enKeys.includes(k));
    const missingInRu = enKeys.filter((k) => !ruKeys.includes(k));

    expect({ missingInEn, missingInRu }).toEqual({ missingInEn: [], missingInRu: [] });
  });
});
