import { useT } from '@/i18n';
interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text }: LoadingStateProps) {
  const t = useT();
  return (
    <div className="bg-card border border-border rounded-xl px-6 py-16 text-center shadow-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gradient-subtle-start to-gradient-subtle-end animate-pulse" />
        <span className="text-sm text-muted-foreground">{text ?? t('common.loading')}</span>
      </div>
    </div>
  );
}
