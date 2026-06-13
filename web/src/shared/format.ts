import { t as ti } from '@/i18n';
import { loadLocale, toIntlLocale } from '@/i18n/locale';

export function formatDate(d: string | null): string | null {
  if (!d) return null;
  const date = new Date(d);
  return date.toLocaleDateString(toIntlLocale(loadLocale()), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(d: string | null): string | null {
  if (!d) return null;
  const date = new Date(d);
  return date.toLocaleDateString(toIntlLocale(loadLocale()), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeConstraintValue(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(toIntlLocale(loadLocale()), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(d: string | null): string {
  if (!d) return ti('common.noTimeData');
  const diff = Date.now() - new Date(d).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return ti('users.time.justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return ti('users.time.minutesAgo', { n: String(minutes) });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return ti('users.time.hoursAgo', { n: String(hours) });
  const days = Math.floor(hours / 24);
  if (days < 30) return ti('users.time.daysAgo', { n: String(days) });
  return formatDate(d) ?? '';
}

export function getFlagTypeColor(t: string): string {
  switch (t) {
    case 'RELEASE':
      return 'text-info bg-info/10 border-info/20';
    case 'KILLSWITCH':
      return 'text-destructive bg-destructive/10 border-destructive/20';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
}

export function getFlagTypeLabel(t: string): string {
  return t === 'RELEASE' ? ti('flags.release') : t === 'KILLSWITCH' ? ti('flags.killswitch') : t;
}
