import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router';
import { useTheme } from 'next-themes';
import { useT } from '@/i18n';
import { useAuth } from '@/app/auth/useAuth';
import { api } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { UserProfileMenu } from '@/app/components/UserProfileMenu';
import { Flag, GitBranch, UserCog } from '@/shared/icons';
import { PageErrorBoundary } from '@/app/components/PageErrorBoundary';
import { OnboardingWizard } from '@/app/components/onboarding';
import {
  isOnboardingComplete,
  markOnboardingComplete,
  resetOnboardingComplete,
} from '@/shared/onboardingUtils';
import { extractDominantColor, lightenForDarkMode } from '@/shared/extractLogoColor';
import { SkipLink } from '@/shared/components/SkipLink';
import { AppSidebar, AppSidebarProvider } from '@/app/components/AppSidebar';

import {
  useProjectQuery,
  useEnrichedFlagsQuery,
  useUsersQuery,
  useInvalidateQueries,
} from '@/app/hooks/queries';

export function DashboardLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useT();
  const [accentColor, setAccentColor] = useState('#7c3aed');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [logoVersion, setLogoVersion] = useState(0);
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
    () => (isDark ? lightenForDarkMode(accentColor) : accentColor),
    [accentColor, isDark],
  );

  const { invalidateProjects } = useInvalidateQueries();
  const queryClient = useQueryClient();
  useEffect(() => {
    const handler = () => {
      invalidateProjects();
      setLogoVersion((v) => v + 1);
    };
    window.addEventListener('project-updated', handler);
    return () => window.removeEventListener('project-updated', handler);
  }, [invalidateProjects]);

  const handleDismiss = useCallback(() => {
    setShowOnboarding(false);
    markOnboardingComplete();
    queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
    queryClient.invalidateQueries({ queryKey: ['environments'] });
    queryClient.invalidateQueries({ queryKey: ['contexts'] });
    queryClient.refetchQueries({ queryKey: ['flags', 'enriched'], type: 'active' });
    queryClient.refetchQueries({ queryKey: ['environments'], type: 'active' });
    queryClient.refetchQueries({ queryKey: ['contexts'], type: 'active' });
  }, [queryClient]);

  const handleProjectCreated = useCallback(() => {
    invalidateProjects();
  }, [invalidateProjects]);

  useEffect(() => {
    if (!user || projectLoading) return;
    if (projectId === null) {
      resetOnboardingComplete();
      setShowOnboarding(true);
      return;
    }
    if (isOnboardingComplete()) return;
    if (flags != null && flags.length === 0) {
      setShowOnboarding(true);
    }
  }, [user, projectLoading, projectId, flags]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
        input?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <AppSidebarProvider>
      <SkipLink />
      <div className="w-full overflow-hidden">
        <div className="flex h-screen bg-gradient-to-br from-background to-secondary text-foreground font-sans transition-colors overflow-hidden">
          <AppSidebar />

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                {projectLogo && projectId ? (
                  <img
                    key={logoVersion}
                    src={`${api.projects.getLogoUrl(projectId)}?v=${logoVersion}`}
                    alt={projectName ?? ''}
                    onLoad={handleLogoLoad}
                    className="w-7 h-7 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-caption font-bold shadow-sm text-white">
                    {(projectName ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <span
                  className="text-h2 font-semibold bg-clip-text text-transparent truncate"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${displayColor}, ${displayColor}cc)`,
                  }}
                >
                  {projectName ?? '—'}
                </span>
                <canvas ref={canvasRef} className="hidden" />
                <div className="h-5 w-px bg-border mx-1" />
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent">
                        <Flag size={12} />
                        <span className="tabular-nums font-mono text-body-sm">{stats.flags}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-caption">
                      {t('navigation.flags')}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent">
                        <UserCog size={12} />
                        <span className="tabular-nums font-mono text-body-sm">{stats.users}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-caption">
                      {t('navigation.users')}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent">
                        <GitBranch size={12} />
                        <span className="tabular-nums font-mono text-body-sm">
                          {stats.segments}
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-caption">
                      {t('navigation.segments')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <UserProfileMenu />
              </div>
            </header>

            <main
              id="main-content"
              className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-background to-secondary p-8 transition-colors min-w-0"
            >
              <div className="max-w-[90rem] mx-auto">
                <PageErrorBoundary>
                  <Outlet />
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
    </AppSidebarProvider>
  );
}
