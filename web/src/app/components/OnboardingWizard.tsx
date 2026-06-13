import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Rocket, ChevronLeft, Building2, Upload } from "@/shared/icons";
import { GradientButton } from "@/shared";
import { api, setToken, setRefreshToken } from "@/api";
import { useT } from '@/i18n';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface OnboardingWizardProps {
  open: boolean;
  startStep: number;
  onDismiss: () => void;
  onProjectCreated: () => void;
}

const STEPS = [
  { title: 'onboarding.step0.title' as const, description: 'onboarding.step0.description' as const },
  { title: 'onboarding.step1.title' as const, description: 'onboarding.step1.description' as const },
];

export function OnboardingWizard({ open, startStep, onDismiss, onProjectCreated }: OnboardingWizardProps) {
  const t = useT();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(startStep);
  const [flagName, setFlagName] = useState('');
  const [flagKey, setFlagKey] = useState('');
  const [creatingFlag, setCreatingFlag] = useState(false);
  const [flagError, setFlagError] = useState('');
  const [flagCreated, setFlagCreated] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreviewUrl, setPendingLogoPreviewUrl] = useState<string | null>(null);
  const logoPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
        logoPreviewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (open) {
      setStep(startStep);
      setFlagName('');
      setFlagKey('');
      setFlagCreated(false);
      setFlagError('');
      setProjectName('');
      setProjectDesc('');
      setCreatingProject(false);
      setProjectError('');
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
        logoPreviewUrlRef.current = null;
      }
      setPendingLogoFile(null);
      setPendingLogoPreviewUrl(null);
    }
  }, [open, startStep]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    logoPreviewUrlRef.current = url;
    setPendingLogoFile(file);
    setPendingLogoPreviewUrl(url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setProjectError(t('onboarding.projectValidationError'));
      return;
    }
    setCreatingProject(true);
    setProjectError('');
    try {
      const project = await api.projects.create({ name: projectName.trim(), description: projectDesc.trim() || undefined });
      if (pendingLogoFile) {
        try {
          await api.projects.uploadLogo(project.id, pendingLogoFile);
        } catch {
          toast.warning(t('onboarding.projectCreateError'));
        }
      }
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
        logoPreviewUrlRef.current = null;
      }
      setPendingLogoFile(null);
      setPendingLogoPreviewUrl(null);
      const res = await api.auth.selectProject(project.id);
      setToken(res.token);
      setRefreshToken(res.refreshToken);
      onProjectCreated();
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      queryClient.invalidateQueries({ queryKey: ['contexts'] });
      setStep(1);
    } catch (e) {
      setProjectError((e as Error).message || t('onboarding.projectCreateError'));
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateFlag = async () => {
    if (!flagName.trim() || !flagKey.trim()) {
      setFlagError(t('onboarding.flagValidationError'));
      return;
    }
    setCreatingFlag(true);
    setFlagError('');
    try {
      const environments = await api.environments.list();
      const created = await api.flags.create({
        name: flagName.trim(),
        key: flagKey.trim(),
        flagType: 'RELEASE',
      });
      for (const env of environments) {
        await api.strategies.create(created.id, { environmentId: env.id, enabled: false, percentage: 100 });
      }
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
      setFlagCreated(true);
    } catch (e) {
      setFlagError((e as Error).message || t('onboarding.flagCreateError'));
    } finally {
      setCreatingFlag(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 dark:bg-black/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
          >
            <div className="flex">
              <div className="w-1/2 bg-gradient-to-br from-gradient-subtle-start to-gradient-subtle-end p-8 flex items-center justify-center hidden md:flex">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="text-center"
                  >
                    {step === 0 && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center">
                          <Building2 size={28} className="text-white" />
                        </div>
                        <div className="text-xs text-muted-foreground">{t('onboarding.createProject')}</div>
                      </div>
                    )}
                    {step === 1 && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center">
                          <Rocket size={28} className="text-white" />
                        </div>
                        <div className="text-sm font-medium text-primary">RELEASE</div>
                        <div className="text-xs text-muted-foreground font-mono">my-feature</div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex-1 p-8 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col"
                  >
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      {t(STEPS[step].title)}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      {t(STEPS[step].description)}
                    </p>

                    {step === 0 && (
                      <div className="space-y-3 flex-1">
                        <input
                          type="text"
                          value={projectName}
                          onChange={e => setProjectName(e.target.value)}
                          maxLength={120}
                          placeholder={t('onboarding.projectNamePlaceholder')}
                          className="w-full bg-white dark:bg-neutral-950 border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                        />
                        <textarea
                          value={projectDesc}
                          onChange={e => setProjectDesc(e.target.value)}
                          maxLength={500}
                          rows={2}
                          placeholder={t('onboarding.projectDescPlaceholder')}
                          className="w-full bg-white dark:bg-neutral-950 border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none"
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <div className="flex items-center gap-3">
                          {pendingLogoPreviewUrl && (
                            <img
                              src={pendingLogoPreviewUrl}
                              alt="Logo preview"
                              className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary border border-border rounded-xl transition-colors"
                          >
                            <Upload size={12} />
                            {pendingLogoFile ? pendingLogoFile.name : t('onboarding.uploadLogo')}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('onboarding.logoHint')}</p>
                        {projectError && (
                          <p className="text-xs text-red-500">{projectError}</p>
                        )}
                        <GradientButton
                          onClick={handleCreateProject}
                          disabled={creatingProject}
                          loading={creatingProject}
                          className="w-full"
                        >
                          {t('onboarding.createProject')}
                        </GradientButton>
                      </div>
                    )}

                    {step === 1 && !flagCreated && (
                      <div className="space-y-3 flex-1">
                        <input
                          type="text"
                          value={flagName}
                          onChange={e => setFlagName(e.target.value)}
                          maxLength={120}
                          placeholder={t('onboarding.flagNamePlaceholder')}
                          className="w-full bg-white dark:bg-neutral-950 border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground"
                        />
                        <input
                          type="text"
                          value={flagKey}
                          onChange={e => setFlagKey(e.target.value)}
                          maxLength={100}
                          placeholder={t('onboarding.flagKeyPlaceholder')}
                          className="w-full bg-white dark:bg-neutral-950 border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground font-mono"
                        />
                        {flagError && (
                          <p className="text-xs text-red-500">{flagError}</p>
                        )}
                        <GradientButton
                          onClick={handleCreateFlag}
                          disabled={creatingFlag}
                          loading={creatingFlag}
                          icon={<Plus size={16} />}
                          className="w-full"
                        >
                          {t('onboarding.createFirstFlag')}
                        </GradientButton>
                      </div>
                    )}

                    {step === 1 && flagCreated && (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                          <Check size={24} className="text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-foreground">{t('onboarding.flagCreated')}</p>
                        <p className="text-xs text-muted-foreground">{t('onboarding.flagCreatedDescription')}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === step ? 'bg-primary' : i < step ? 'bg-primary/50' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {step === 1 && flagCreated ? (
                      <GradientButton onClick={onDismiss}>
                        {t('onboarding.finish')}
                      </GradientButton>
                    ) : (
                      <>
                        {step > 0 && (
                          <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronLeft size={16} />
                            {t('onboarding.back')}
                          </button>
                        )}
                        {step === 1 && (
                          <button
                            onClick={onDismiss}
                            className="inline-flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {t('onboarding.skip')}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
