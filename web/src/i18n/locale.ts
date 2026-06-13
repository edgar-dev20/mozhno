export type Locale = 'ru' | 'en';

export const DEFAULT_LOCALE: Locale = 'ru';

const STORAGE_KEY = 'mozhno-locale';

export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ru' || stored === 'en') return stored;
  } catch {}

  if (typeof navigator !== 'undefined' && navigator.language) {
    const lang = navigator.language;
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('ru')) return 'ru';
  }

  return DEFAULT_LOCALE;
}

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
}

export function loadLocale(): Locale {
  return detectLocale();
}

export function toIntlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'ru-RU';
}
