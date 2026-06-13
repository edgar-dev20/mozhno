import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectLocale, storeLocale, loadLocale, toIntlLocale, DEFAULT_LOCALE } from "@/i18n/locale";

describe('detectLocale', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns stored locale if set', () => {
    localStorage.setItem('mozhno-locale', 'en');
    expect(detectLocale()).toBe('en');
  });

  it('returns DEFAULT_LOCALE when stored value is invalid', () => {
    localStorage.setItem('mozhno-locale', 'fr');
    const origLang = Object.getOwnPropertyDescriptor(navigator, 'language');
    Object.defineProperty(navigator, 'language', { value: 'fr', configurable: true });
    expect(detectLocale()).toBe(DEFAULT_LOCALE);
    if (origLang) Object.defineProperty(navigator, 'language', origLang);
  });

  it('returns DEFAULT_LOCALE when no storage and no matching navigator', () => {
    const origLang = Object.getOwnPropertyDescriptor(navigator, 'language');
    Object.defineProperty(navigator, 'language', { value: 'fr', configurable: true });
    expect(detectLocale()).toBe(DEFAULT_LOCALE);
    if (origLang) Object.defineProperty(navigator, 'language', origLang);
  });

  it('handles localStorage exceptions gracefully', () => {
    const orig = localStorage.getItem;
    localStorage.getItem = () => { throw new Error('blocked'); };
    expect(detectLocale()).toBeDefined();
    localStorage.getItem = orig;
  });
});

describe('storeLocale', () => {
  it('persists the locale', () => {
    storeLocale('en');
    expect(localStorage.getItem('mozhno-locale')).toBe('en');

    storeLocale('ru');
    expect(localStorage.getItem('mozhno-locale')).toBe('ru');
  });

  it('handles localStorage exceptions gracefully', () => {
    const orig = localStorage.setItem;
    localStorage.setItem = () => { throw new Error('blocked'); };
    expect(() => storeLocale('en')).not.toThrow();
    localStorage.setItem = orig;
  });
});

describe('loadLocale', () => {
  it('returns detected locale', () => {
    localStorage.setItem('mozhno-locale', 'en');
    expect(loadLocale()).toBe('en');
  });
});

describe('toIntlLocale', () => {
  it('returns en-US for en', () => {
    expect(toIntlLocale('en')).toBe('en-US');
  });

  it('returns ru-RU for ru', () => {
    expect(toIntlLocale('ru')).toBe('ru-RU');
  });
});
