import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { fadeUp } from '@/shared/motion';
import { useTheme } from 'next-themes';
import { useT } from '@/i18n';
import { useAuth } from '@/app/auth/useAuth';
import { api } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { UserProfileMenu } from '@/app/components/UserProfileMenu';
import { Flag, GitBranch, UserCog, Sun, Moon, FileText } from '@/shared/icons';
import { Menu } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { PageErrorBoundary } from '@/app/components/PageErrorBoundary';
import { OnboardingWizard } from '@/app/components/onboarding';
import {
  isOnboardingComplete,
  markOnboardingComplete,
  resetOnboardingComplete,
} from '@/shared/onboardingUtils';
import { extractDominantColor } from '@/shared/extractLogoColor';
import { readableAccentColor } from '@/shared/color';
import { SkipLink } from '@/shared/components/SkipLink';
import { AppSidebar, useAppSidebar } from '@/app/components/AppSidebar';

import {
  useProjectQuery,
  useEnrichedFlagsQuery,
  useUsersQuery,
  useInvalidateQueries,
} from '@/app/hooks/queries';

export function DashboardLayout() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const t = useT();
  const { toggleMobile } = useAppSidebar();
  const [accentColor, setAccentColor] = useState('#1a6b60');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: project, isLoading: projectLoading } = useProjectQuery();
  const projectId = project?.id ?? null;
  const projectName = project?.name ?? null;
  const projectLogo = project?.logo ?? null;

  const { data: enriched } = useEnrichedFlagsQuery(projectId);
  const flags = useMemo(() => enriched?.flags ?? [], [enriched?.flags]);
  const segments = useMemo(() => enriched?.segments ?? [], [enriched?.segments]);

  const { data: users = [] } = useUsersQuery(!!projectId);

  const stats = useMemo(
    () => ({
      flags: flags.length,
      users: users.length,
      segments: segments.length,
    }),
    [flags, users, segments],
  );

  const handleLogoLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (!projectId) return;
      const color = extractDominantColor(e.currentTarget, canvasRef.current);
      canvasRef.current = e.currentTarget as unknown as HTMLCanvasElement;
      setAccentColor(color);
    },
    [projectId],
  );

  const isDark = theme === 'dark';
  const displayColor = useMemo(
    () => readableAccentColor(accentColor, isDark),
    [accentColor, isDark],
  );

  const { invalidateProjects } = useInvalidateQueries();
  const queryClient = useQueryClient();
  useEffect(() => {
    const handler = () => {
      invalidateProjects();
    };
    window.addEventListener('project-updated', handler);
    return () => window.removeEventListener('project-updated', handler);
  }, [invalidateProjects]);

  const handleDismiss = useCallback(() => {
    setShowOnboarding(false);
    markOnboardingComplete();
    queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
    queryClient.invalidateQueries({ queryKey: queryKeys.environments.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.contexts.all });
    queryClient.refetchQueries({ queryKey: queryKeys.flags.enriched, type: 'active' });
    queryClient.refetchQueries({ queryKey: queryKeys.environments.all, type: 'active' });
    queryClient.refetchQueries({ queryKey: queryKeys.contexts.all, type: 'active' });
  }, [queryClient]);

  const handleProjectCreated = useCallback(() => {
    invalidateProjects();
  }, [invalidateProjects]);

  useEffect(() => {
    if (!user || projectLoading) return;
    if (projectId === null) {
      resetOnboardingComplete();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOnboarding(true);
      return;
    }
    if (isOnboardingComplete()) return;
    if (flags != null && flags.length === 0) {
      setShowOnboarding(false);
    }
  }, [user, projectLoading, projectId, flags]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        e.stopPropagation();
        const input = document.querySelector<HTMLInputElement>('[data-search-input]');
        input?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <SkipLink />
      <div className="w-full overflow-hidden">
        <div className="flex h-screen bg-gradient-to-br from-background to-secondary text-foreground font-sans transition-colors overflow-hidden">
          <AppSidebar />

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <header className="h-14 border-b border-border bg-card flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-sm dark:shadow-[0_1px_3px_-1px_var(--color-brand)]/8 transition-colors min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  className="md:hidden relative z-10 p-2 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                  onClick={toggleMobile}
                  aria-label={t('navigation.menu')}
                >
                  <Menu size={20} />
                </button>
                {projectLogo && projectId ? (
                  <img
                    key={projectLogo}
                    src={`${api.projects.getLogoUrl(projectId)}?v=${encodeURIComponent(projectLogo)}`}
                    alt={projectName ?? ''}
                    onLoad={handleLogoLoad}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary flex items-center justify-center text-[10px] sm:text-caption font-bold shadow-sm text-primary-foreground ring-1 ring-chart-4/30 shrink-0">
                    {(projectName ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <span
                  className="hidden sm:inline-block size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: displayColor }}
                  aria-hidden="true"
                />
                <span className="text-h3 sm:text-h2 font-semibold text-foreground truncate">
                  {projectName ?? '—'}
                </span>
                <canvas ref={canvasRef} className="hidden" />
                <div className="hidden sm:block h-5 w-px bg-border mx-1" />
                <div className="hidden sm:flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        role="status"
                        aria-label={`${stats.flags} ${t('navigation.flags')}`}
                        className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent"
                      >
                        <Flag size={12} aria-hidden="true" />
                        <span className="tabular-nums font-mono text-body-sm" aria-hidden="true">{stats.flags}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-caption">
                      {t('navigation.flags')}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        role="status"
                        aria-label={`${stats.users} ${t('navigation.users')}`}
                        className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent"
                      >
                        <UserCog size={12} aria-hidden="true" />
                        <span className="tabular-nums font-mono text-body-sm" aria-hidden="true">{stats.users}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-caption">
                      {t('navigation.users')}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        role="status"
                        aria-label={`${stats.segments} ${t('navigation.segments')}`}
                        className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent"
                      >
                        <GitBranch size={12} aria-hidden="true" />
                        <span className="tabular-nums font-mono text-body-sm" aria-hidden="true">{stats.segments}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-caption">
                      {t('navigation.segments')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="relative inline-flex h-7 w-11 shrink-0 items-center rounded-full border border-border bg-muted transition-colors duration-300 hover:bg-accent"
                  aria-label={theme === 'dark' ? t('userMenu.lightTheme') : t('userMenu.darkTheme')}
                >
                  <span
                    className={cn(
                      'absolute flex items-center justify-center size-5 rounded-full bg-card shadow-sm transition-transform duration-300',
                      theme === 'dark' ? 'translate-x-0.5' : 'translate-x-[21px]',
                    )}
                  >
                    {theme === 'dark' ? (
                      <Moon size={12} className="text-muted-foreground" />
                    ) : (
                      <Sun size={12} className="text-warning" />
                    )}
                  </span>
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://docs.mozhno.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex items-center justify-center size-8 rounded-md text-muted-foreground/70 hover:text-muted-foreground hover:bg-accent transition-colors"
                      aria-label={t('common.docs')}
                    >
                      <FileText size={18} />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-caption">
                    {t('common.docs')}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://github.com/mozhno-dev/mozhno"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex items-center justify-center size-8 rounded-md text-muted-foreground/70 hover:text-muted-foreground hover:bg-accent transition-colors"
                      aria-label="GitHub"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-caption">
                    GitHub
                  </TooltipContent>
                </Tooltip>
                <UserProfileMenu />
              </div>
            </header>

            <main
              id="main-content"
              className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-background to-secondary p-3 sm:p-6 lg:p-8 transition-colors min-w-0"
            >
              <div className="max-w-[90rem] mx-auto w-full">
                <PageErrorBoundary>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={location.pathname}
                      variants={fadeUp}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                    >
                      <Outlet />
                    </motion.div>
                  </AnimatePresence>
                </PageErrorBoundary>
              </div>
            </main>
          </div>

          {showOnboarding && (
            <OnboardingWizard
              open={showOnboarding}
              startStep={projectId === null ? 0 : 1}
              onDismiss={handleDismiss}
              onProjectCreated={handleProjectCreated}
            />
          )}
        </div>
      </div>
    </>
  );
}
