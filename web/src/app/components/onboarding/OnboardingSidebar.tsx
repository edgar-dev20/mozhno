import { motion, AnimatePresence } from 'motion/react';
import { Building2, Rocket } from '@/shared/icons';
import { useT } from '@/i18n';

interface OnboardingSidebarProps {
  step: number;
}

const SIDEBAR_STEPS = [
  { icon: Building2, label: 'onboarding.createProject' as const },
  { icon: Rocket, label: 'onboarding.step1.title' as const },
];

export function OnboardingSidebar({ step }: OnboardingSidebarProps) {
  const t = useT();
  const CurrentIcon = SIDEBAR_STEPS[step]?.icon;

  return (
    <div className="w-2/5 bg-secondary p-8 items-center justify-center hidden md:flex">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center">
              {CurrentIcon ? <CurrentIcon size={28} className="text-white" /> : null}
            </div>
            {step === 0 && (
              <div className="text-xs text-muted-foreground">{t('onboarding.createProject')}</div>
            )}
            {step === 1 && (
              <>
                <div className="text-sm font-medium text-primary">RELEASE</div>
                <div className="text-xs text-muted-foreground font-mono">my-feature</div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
