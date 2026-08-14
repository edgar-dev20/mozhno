import { useT } from '@/i18n';

export function FlagEnabledDot({
  flagName,
  envName,
  enabled,
}: {
  flagName: string;
  envName: string;
  enabled: boolean;
}) {
  const t = useT();
  return (
    <span
      role="status"
      aria-label={`${flagName} — ${envName}: ${enabled ? t('common.enabled') : t('common.disabled')}`}
      className={`inline-block size-2.5 rounded-full ${enabled ? 'bg-success' : 'bg-muted-foreground/30'}`}
    />
  );
}
