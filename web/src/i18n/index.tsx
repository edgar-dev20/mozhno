import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import type { RuMessages, MessagesShape } from '@/i18n/locales/ru';
import { ru } from '@/i18n/locales/ru';
import { getMessages } from '@/i18n/messages';
import type { Locale } from '@/i18n/locale';
import { DEFAULT_LOCALE, detectLocale, storeLocale, loadLocale } from '@/i18n/locale';

type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K;
}[keyof T & string];

export type MessageKey = NestedKeyOf<RuMessages>;

function getByPath(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : path;
}

function interpolate(raw: string, params?: Record<string, string>): string {
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, name: string) => params[name] ?? `{{${name}}}`);
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      storeLocale(newLocale);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
      }
    },
    [],
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function useT(): (key: MessageKey, params?: Record<string, string>) => string {
  const { locale } = useLocale();
  return useCallback(
    (key: MessageKey, params?: Record<string, string>) => {
      const messages = getMessages(locale);
      const raw = getByPath(messages as unknown as Record<string, unknown>, key);
      return interpolate(raw, params);
    },
    [locale],
  );
}

export function t(key: MessageKey, params?: Record<string, string>): string {
  const messages = getMessages(loadLocale());
  const raw = getByPath(messages as unknown as Record<string, unknown>, key);
  return interpolate(raw, params);
}

export { ru };
export type { RuMessages, MessagesShape };
