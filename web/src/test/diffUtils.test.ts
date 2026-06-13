import { describe, it, expect } from 'vitest';
import { computeDiff } from '@/shared/diffUtils';

describe('computeDiff', () => {
  it('returns empty array for identical objects', () => {
    const changes = computeDiff({ a: 1 }, { a: 1 }, { a: 'A' });
    expect(changes).toHaveLength(0);
  });

  it('detects changed values', () => {
    const changes = computeDiff({ a: 1 }, { a: 2 }, { a: 'A' });
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ field: 'a', label: 'A', before: '1', after: '2' });
  });

  it('detects added keys', () => {
    const changes = computeDiff({}, { a: 'x' }, { a: 'A' });
    expect(changes).toHaveLength(1);
    expect(changes[0].before).toBe('');
    expect(changes[0].after).toBe('x');
  });

  it('detects removed keys', () => {
    const changes = computeDiff({ a: 'x' }, {}, { a: 'A' });
    expect(changes).toHaveLength(1);
    expect(changes[0].before).toBe('x');
    expect(changes[0].after).toBe('');
  });

  it('treats null and undefined as different', () => {
    const changes = computeDiff({ a: null }, { a: undefined }, { a: 'A' });
    expect(changes).toHaveLength(1);
  });

  it('stringifies object values', () => {
    const changes = computeDiff({ x: { a: 1 } }, { x: { a: 2 } }, { x: 'Label' });
    expect(changes).toHaveLength(1);
    expect(changes[0].before).toBe('{"a":1}');
    expect(changes[0].after).toBe('{"a":2}');
  });

  it('uses key as fallback label', () => {
    const changes = computeDiff({ a: 1 }, { a: 2 }, {});
    expect(changes[0].label).toBe('a');
  });

  it('handles multiple changes', () => {
    const changes = computeDiff(
      { a: 1, b: 2, c: 3 },
      { a: 9, b: 2, c: 0 },
      { a: 'Alpha', b: 'Beta', c: 'Gamma' },
    );
    expect(changes).toHaveLength(2);
    expect(changes.map((c) => c.field).sort()).toEqual(['a', 'c']);
  });
});
