import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import { useTheme } from 'next-themes';
import { useT } from '@/i18n';
import { useAuth } from '@/app/auth/useAuth';
import { PluginSlot } from '@/app/components/PluginSlot';
import { api } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { UserProfileMenu } from '@/app/components/UserProfileMenu';
import { Flag, GitBranch, UserCog } from '@/shared/icons';
import { PageErrorBoundary } from '@/app/components/PageErrorBoundary';
import { OnboardingWizard } from '@/app/components/OnboardingWizard';
import { isOnboardingComplete, markOnboardingComplete, resetOnboardingComplete } from '@/shared/onboardingUtils';
import { extractDominantColor, lightenForDarkMode } from '@/shared/extractLogoColor';
import { SkipLink } from '@/shared/components/SkipLink';
import { MANAGEMENT_ITEMS, ADMIN_ITEMS } from '@/app/components/navConfig';

import {
  useProjectQuery,
  useEnrichedFlagsQuery,
  useUsersQuery,
  useInvalidateQueries,
} from '@/app/hooks/queries';

export function DashboardLayout() {
  const location = useLocation();
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
      setLogoVersion(v => v + 1);
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

  const isAdmin = user?.role === 'admin';

  const renderNavLink = (item: { path: string; labelKey: string; icon: React.ComponentType<{ size?: number; className?: string }> }) => {
    const Icon = item.icon;
    const isActive = location.pathname.startsWith(item.path);
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive: _linkActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium w-full text-left ${
            isActive
              ? 'bg-accent shadow-sm font-semibold text-foreground'
              : 'text-muted-foreground hover:bg-secondary'
          }`
        }
      >
        <Icon size={18} className={isActive ? 'text-foreground/80' : 'text-muted-foreground/70'} />
        <span>{t(item.labelKey as never)}</span>
      </NavLink>
    );
  };

  return (
    <>
      <SkipLink />
      <div className="flex h-screen bg-gradient-to-br from-background to-secondary text-foreground font-sans transition-colors">
      <aside className="w-64 border-r border-border bg-card flex flex-col shadow-sm transition-colors relative z-10">
        <nav aria-label={t('common.navigation')} className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-border transition-colors">
            <div className="text-3xl font-semibold tracking-[0.2em]" style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace' }}>
              <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">можно</span>
              <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent text-[0.55em] -ml-[0.35em]">.</span>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
              {t('navigation.management')}
            </div>
            {MANAGEMENT_ITEMS.map(renderNavLink)}

            {isAdmin && (
              <>
                <div className="mt-8 px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('navigation.administration')}
                </div>
                <PluginSlot slotId="sidebar.admin" />
                {ADMIN_ITEMS.map(renderNavLink)}
              </>
            )}
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            {projectLogo && projectId ? (
              <img
                key={logoVersion}
                src={`${api.projects.getLogoUrl(projectId)}?v=${logoVersion}`}
                alt={projectName ?? ''}
                onLoad={handleLogoLoad}
                className="w-8 h-8 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-gradient-start to-gradient-end flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {(projectName ?? '?')[0].toUpperCase()}
              </div>
            )}
            <span
              className="text-base font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${displayColor}, ${displayColor}cc)` }}
            >
              {projectName ?? '—'}
            </span>
            <canvas ref={canvasRef} className="hidden" />
            <div className="h-5 w-px bg-border mx-1" />
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent">
                    <Flag size={12} />
                    <span className="tabular-nums">{stats.flags}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{t('navigation.flags')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent">
                    <UserCog size={12} />
                    <span className="tabular-nums">{stats.users}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{t('navigation.users')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default px-2 py-1 rounded-md hover:bg-accent">
                    <GitBranch size={12} />
                    <span className="tabular-nums">{stats.segments}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{t('navigation.segments')}</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserProfileMenu />
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary p-6 transition-colors">
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
    </>
  );
}
