import { describe, it, expect } from 'vitest';
import { createFlagSchema, editFlagSchema } from '@/app/components/flags/schemas';

describe('createFlagSchema', () => {
  const validData = {
    name: 'Feature Toggle',
    key: 'feature-toggle',
    description: 'A test flag',
    flagType: 'RELEASE' as const,
  };

  it('validates correct data', () => {
    expect(() => createFlagSchema.parse(validData)).not.toThrow();
  });

  it('rejects empty name', () => {
    const result = createFlagSchema.safeParse({ ...validData, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name > 120 chars', () => {
    const result = createFlagSchema.safeParse({ ...validData, name: 'a'.repeat(121) });
    expect(result.success).toBe(false);
  });

  it('rejects empty key', () => {
    const result = createFlagSchema.safeParse({ ...validData, key: '' });
    expect(result.success).toBe(false);
  });

  it('rejects key with special chars (cyrillic, spaces, @)', () => {
    const badKeys = ['флаг', 'feature toggle', 'flag@name'];
    for (const key of badKeys) {
      const result = createFlagSchema.safeParse({ ...validData, key });
      expect(result.success).toBe(false);
    }
  });

  it('accepts key with valid chars (letters, numbers, -, _)', () => {
    const goodKeys = ['my-flag', 'FLAG_1', 'featureToggle', 'flag_2024', 'FLAG'];
    for (const key of goodKeys) {
      const result = createFlagSchema.safeParse({ ...validData, key });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid flagType', () => {
    const result = createFlagSchema.safeParse({ ...validData, flagType: 'BOOLEAN' });
    expect(result.success).toBe(false);
  });

  it('accepts RELEASE and KILLSWITCH', () => {
    expect(() => createFlagSchema.parse({ ...validData, flagType: 'RELEASE' })).not.toThrow();
    expect(() => createFlagSchema.parse({ ...validData, flagType: 'KILLSWITCH' })).not.toThrow();
  });
});

describe('editFlagSchema', () => {
  it('validates correct data (no key field needed)', () => {
    const result = editFlagSchema.safeParse({
      name: 'Updated Feature',
      description: 'Updated description',
      flagType: 'RELEASE',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = editFlagSchema.safeParse({
      name: '',
      description: 'Desc',
      flagType: 'KILLSWITCH',
    });
    expect(result.success).toBe(false);
  });
});
