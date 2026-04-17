import { describe, it, expect } from 'vitest';
import { getMessages } from "@/i18n/messages";

describe('getMessages', () => {
  it('returns ru messages for ru locale', () => {
    const msgs = getMessages('ru');
    expect(msgs.common.appName).toBe('можно');
  });

  it('returns en messages for en locale', () => {
    const msgs = getMessages('en');
    expect(msgs.common.appName).toBe('mozhno');
  });

  it('falls back to ru for unknown locale', () => {
    const msgs = getMessages('fr' as never);
    expect(msgs.common.appName).toBe('можно');
  });
});
