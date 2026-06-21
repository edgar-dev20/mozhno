import { ChevronLeft } from '@/shared/icons';
import { GradientButton } from '@/shared';
import { useT } from '@/i18n';

interface OnboardingStepperProps {
  totalSteps: number;
  currentStep: number;
  flagCreated: boolean;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

export function OnboardingStepper({
  totalSteps,
  currentStep,
  flagCreated,
  onBack,
  onSkip,
  onFinish,
}: OnboardingStepperProps) {
  const t = useT();

  return (
    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentStep ? 'bg-chart-4' : i < currentStep ? 'bg-primary/50' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {currentStep === 1 && flagCreated ? (
          <GradientButton onClick={onFinish}>{t('onboarding.finish')}</GradientButton>
        ) : (
          <>
            {currentStep > 0 && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={16} />
                {t('onboarding.back')}
              </button>
            )}
            {currentStep === 1 && (
              <button
                onClick={onSkip}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('onboarding.skip')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
