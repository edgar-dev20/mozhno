import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, timeAgo, getFlagTypeColor, getFlagTypeLabel } from "@/shared/format";

describe('formatDate', () => {
  it('returns null for null input', () => {
    expect(formatDate(null)).toBeNull();
  });

  it('formats a valid date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
  });
});

describe('formatDateTime', () => {
  it('returns null for null input', () => {
    expect(formatDateTime(null)).toBeNull();
  });

  it('formats with time component', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z');
    expect(result).toBeDefined();
    expect(result).toContain('янв');
  });
});

describe('timeAgo', () => {
  it('returns fallback for null', () => {
    expect(timeAgo(null)).toBe('Никогда не использовался');
  });

  it('returns recent for current time', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('только что');
  });

  it('returns minutes ago', () => {
    const d = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(d)).toBe('5 мин. назад');
  });
});

describe('getFlagTypeColor', () => {
  it('returns blue for RELEASE', () => {
    expect(getFlagTypeColor('RELEASE')).toContain('blue');
  });

  it('returns red for KILLSWITCH', () => {
    expect(getFlagTypeColor('KILLSWITCH')).toContain('red');
  });

  it('returns neutral for unknown types', () => {
    expect(getFlagTypeColor('unknown')).toContain('neutral');
  });
});

describe('getFlagTypeLabel', () => {
  it('returns Релиз for RELEASE', () => {
    expect(getFlagTypeLabel('RELEASE')).toBe('Релиз');
  });

  it('returns Рубильник for KILLSWITCH', () => {
    expect(getFlagTypeLabel('KILLSWITCH')).toBe('Рубильник');
  });

  it('returns original for unknown', () => {
    expect(getFlagTypeLabel('custom')).toBe('custom');
  });
});
