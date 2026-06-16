import { Check } from '@/shared/icons';
import { useT } from '@/i18n';

export function OnboardingSuccess() {
  const t = useT();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
        <Check size={24} className="text-green-600 dark:text-green-400" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {t('onboarding.flagCreated')}
      </p>
      <p className="text-xs text-muted-foreground">
        {t('onboarding.flagCreatedDescription')}
      </p>
    </div>
  );
}
