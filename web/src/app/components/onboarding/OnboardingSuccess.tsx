import { Check } from '@/shared/icons';
import { useT } from '@/i18n';

export function OnboardingSuccess() {
  const t = useT();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-success dark:bg-success/20 flex items-center justify-center">
        <Check size={24} className="text-success dark:text-success" />
      </div>
      <p className="text-body-sm font-medium text-foreground">{t('onboarding.flagCreated')}</p>
      <p className="text-caption text-muted-foreground">{t('onboarding.flagCreatedDescription')}</p>
    </div>
  );
}
