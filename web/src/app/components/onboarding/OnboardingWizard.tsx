import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useT } from '@/i18n';
import { CreateProjectStep } from './CreateProjectStep';
import { CreateFlagStep } from './CreateFlagStep';
import { OnboardingSuccess } from './OnboardingSuccess';
import { OnboardingSidebar } from './OnboardingSidebar';
import { OnboardingStepper } from './OnboardingStepper';
import { useCreateProject } from './useCreateProject';
import { useCreateFlag } from './useCreateFlag';

interface OnboardingWizardProps {
  open: boolean;
  existingProjectId: number | null;
  existingProjectName: string | null;
  onDismiss: () => void;
  onProjectCreated: () => void;
}

const STEPS = [
  {
    title: 'onboarding.step0.title' as const,
    description: 'onboarding.step0.description' as const,
  },
  {
    title: 'onboarding.step1.title' as const,
    description: 'onboarding.step1.description' as const,
  },
];

export function OnboardingWizard({
  open,
  existingProjectId,
  existingProjectName,
  onDismiss,
  onProjectCreated,
}: OnboardingWizardProps) {
  const t = useT();
  const [step, setStep] = useState(0);
  const {
    projectName,
    setProjectName,
    projectDesc,
    setProjectDesc,
    creatingProject,
    projectError,
    pendingLogoFile,
    pendingLogoPreviewUrl,
    fileInputRef,
    handleLogoUpload,
    handleCreateProject,
    resetProject,
  } = useCreateProject({ existingProjectId, existingProjectName });
  const {
    flagName,
    setFlagName,
    flagKey,
    setFlagKey,
    creatingFlag,
    flagError,
    flagCreated,
    handleCreateFlag,
    resetFlag,
  } = useCreateFlag();

  useEffect(() => {
    if (open) {
      resetProject();
      resetFlag();
    }
  }, [open, resetProject, resetFlag]);

  const onCreateProject = useCallback(async () => {
    await handleCreateProject(onProjectCreated, () => setStep(1));
  }, [handleCreateProject, onProjectCreated]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card border border-border rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.12)] w-full max-w-2xl mx-4 overflow-hidden"
          >
            <div className="flex">
              <OnboardingSidebar step={step} />

              <div className="flex-1 p-6 sm:p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-[-120px] right-[-80px] w-[350px] h-[350px] bg-gradient-to-br from-gradient-start/6 to-gradient-end/3 dark:from-gradient-start/4 dark:to-gradient-end/2 rounded-full blur-3xl md:hidden" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col"
                  >
                    <h2 className="text-h2 font-semibold text-foreground mb-2">
                      {t(STEPS[step].title)}
                    </h2>
                    <p className="text-body-sm text-muted-foreground leading-relaxed mb-6">
                      {t(STEPS[step].description)}
                    </p>

                    {step === 0 && (
                      <CreateProjectStep
                        projectName={projectName}
                        setProjectName={setProjectName}
                        projectDesc={projectDesc}
                        setProjectDesc={setProjectDesc}
                        creating={creatingProject}
                        error={projectError}
                        pendingLogoFile={pendingLogoFile}
                        pendingLogoPreviewUrl={pendingLogoPreviewUrl}
                        fileInputRef={fileInputRef}
                        onLogoUpload={handleLogoUpload}
                        onCreate={onCreateProject}
                        existingProjectId={existingProjectId}
                      />
                    )}

                    {step === 1 && !flagCreated && (
                      <CreateFlagStep
                        flagName={flagName}
                        setFlagName={setFlagName}
                        flagKey={flagKey}
                        setFlagKey={setFlagKey}
                        creating={creatingFlag}
                        error={flagError}
                        onCreate={handleCreateFlag}
                      />
                    )}

                    {step === 1 && flagCreated && <OnboardingSuccess />}
                  </motion.div>
                </AnimatePresence>

                <OnboardingStepper
                  totalSteps={STEPS.length}
                  currentStep={step}
                  flagCreated={flagCreated}
                  onBack={handleBack}
                  onSkip={onDismiss}
                  onFinish={onDismiss}
                  onSkipStepZero={onDismiss}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
