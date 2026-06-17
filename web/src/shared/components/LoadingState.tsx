import { useT } from '@/i18n';
import { Card } from '@/shared/components/Card';

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text }: LoadingStateProps) {
  const t = useT();
  return (
    <Card padded className="px-6 py-20 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-muted animate-pulse ring-1 ring-border/50" />
        <span className="text-body-sm text-muted-foreground">{text ?? t('common.loading')}</span>
      </div>
    </Card>
  );
}
