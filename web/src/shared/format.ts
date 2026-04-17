import { t as ti } from '@/i18n';
export function formatDate(d: string | null): string | null {
  if (!d) return null;
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(d: string | null): string | null {
  if (!d) return null;
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    case 'RELEASE': return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
    case 'KILLSWITCH': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
    default: return 'text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-500/10 border-neutral-200 dark:border-neutral-500/20';
  }
}

export function getFlagTypeLabel(t: string): string {
  return t === 'RELEASE' ? ti('flags.release') : t === 'KILLSWITCH' ? ti('flags.killswitch') : t;
}
