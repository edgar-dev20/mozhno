import type { MessagesShape } from '@/i18n/locales/ru';
import { ru } from '@/i18n/locales/ru';
import { en } from '@/i18n/locales/en';
import type { Locale } from '@/i18n/locale';

const messages: Record<Locale, MessagesShape> = { ru, en };

export function getMessages(locale: Locale): MessagesShape {
  return messages[locale] ?? messages.ru;
}
