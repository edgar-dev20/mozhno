import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useT, type MessageKey } from '@/i18n';
import { useAuth } from '@/app/auth/useAuth';
import { Wordmark } from '@/shared/components/Wordmark';
import { Hairline } from '@/shared/components/Hairline';
import { GradientButton } from '@/shared/components/GradientButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { PanelLeftIcon } from 'lucide-react';
import { MANAGEMENT_ITEMS, ADMIN_ITEMS } from '@/app/components/navConfig';
import type { NavItem } from '@/app/components/navConfig';

const SIDEBAR_COOKIE = 'sidebar_state';
const MOBILE_BP = 768;

const SidebarCtx = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleMobile: () => void;
  mobileOpen: boolean;
}>({ collapsed: false, setCollapsed: () => {}, toggleMobile: () => {}, mobileOpen: false });

export function useAppSidebar() {
  return useContext(SidebarCtx);
}

const STYLE_LOCK_ID = '__sidebar-transition-lock';

function injectLockStyle() {
  if (document.getElementById(STYLE_LOCK_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_LOCK_ID;
  style.textContent = 'html, body, #main-content, #main-content * { overflow-x: hidden !important; }';
  document.head.appendChild(style);
}

function removeLockStyle() {
  const el = document.getElementById(STYLE_LOCK_ID);
  el?.remove();
}

export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.cookie.includes(`${SIDEBAR_COOKIE}=true`);
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const fallbackTimerRef = useRef<number>(0);
  const transitionEndBoundRef = useRef<boolean>(false);

  const lockOverflow = useCallback(() => {
    injectLockStyle();
    transitionEndBoundRef.current = false;
  }, []);

  const unlockOverflow = useCallback(() => {
    removeLockStyle();
    clearTimeout(fallbackTimerRef.current);
  }, []);

  const scheduleUnlock = useCallback(() => {
    clearTimeout(fallbackTimerRef.current);

    const aside = document.querySelector('aside[aria-label="Sidebar"]');
    if (!aside) {
      fallbackTimerRef.current = window.setTimeout(unlockOverflow, 500);
      return;
    }

    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'width' || transitionEndBoundRef.current) return;
      transitionEndBoundRef.current = true;
      aside.removeEventListener('transitionend', onEnd);
      unlockOverflow();
    };

    aside.addEventListener('transitionend', onEnd);
    fallbackTimerRef.current = window.setTimeout(() => {
      aside.removeEventListener('transitionend', onEnd);
      unlockOverflow();
    }, 500);
  }, [unlockOverflow]);

  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);

  const flushCollapse = useCallback((v: boolean) => {
    lockOverflow();
    setCollapsedState(v);
    document.cookie = `${SIDEBAR_COOKIE}=${v}; path=/; max-age=${60 * 60 * 24 * 365}`;
    scheduleUnlock();
  }, [lockOverflow, scheduleUnlock]);

  const setCollapsed = useCallback((v: boolean) => {
    flushCollapse(v);
  }, [flushCollapse]);

  useEffect(() => {
    return () => {
      clearTimeout(fallbackTimerRef.current);
      removeLockStyle();
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (window.innerWidth < MOBILE_BP) {
          setMobileOpen((o) => !o);
        } else {
          lockOverflow();
          setCollapsedState((c) => {
            const next = !c;
            document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
            return next;
          });
          scheduleUnlock();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lockOverflow, scheduleUnlock]);

  return (
    <SidebarCtx.Provider value={{ collapsed, setCollapsed, toggleMobile, mobileOpen }}>
      {children}
    </SidebarCtx.Provider>
  );
}

function NavLinkItem({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  const { pathname } = useLocation();
  const t = useT();
  const Icon = item.icon;
  const isActive = pathname.startsWith(item.path);

  const link = (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive: active }) =>
        `flex items-center gap-3 rounded-xl transition-all duration-200 text-body-sm font-medium w-full text-left px-3 py-2.5 ${
          active
            ? 'bg-accent shadow-sm font-semibold text-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`
      }
    >
      <Icon size={18} className={isActive ? 'text-foreground/80' : 'text-muted-foreground/70'} />
      {!collapsed && <span className="truncate">{t(item.labelKey as MessageKey)}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {t(item.labelKey as MessageKey)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

function SidebarContent({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { collapsed, setCollapsed } = useContext(SidebarCtx);
  const t = useT();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
      <nav aria-label="Navigation" className="flex flex-col h-full">
      <div className={`h-14 flex items-center border-b border-border transition-all ${collapsed && !mobile ? 'justify-center px-2' : 'px-5'}`}>
        {collapsed && !mobile ? (
          <Wordmark text="м" size="sm" />
        ) : (
          <Wordmark text="можно" size="md" />
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-1 overflow-y-auto py-3 px-3">
          <div className={`${collapsed && !mobile ? 'sr-only' : 'px-3 mb-1.5 mt-1 text-overline font-semibold text-muted-foreground uppercase tracking-wider'}`}>
            {t('navigation.management')}
          </div>
          {MANAGEMENT_ITEMS.map((item) => (
            <NavLinkItem key={item.path} item={item} collapsed={collapsed && !mobile} onClick={onNavigate} />
          ))}

          {isAdmin && (
            <>
              {collapsed && !mobile ? null : <Hairline className="my-3" />}
              <div className={`${collapsed && !mobile ? 'sr-only' : 'px-3 mb-1.5 text-overline font-semibold text-muted-foreground uppercase tracking-wider'}`}>
                {t('navigation.administration')}
              </div>
              {ADMIN_ITEMS.map((item) => (
                <NavLinkItem key={item.path} item={item} collapsed={collapsed && !mobile} onClick={onNavigate} />
              ))}
            </>
          )}
        </div>

        <div
          className="flex-1 min-h-[0.5rem] cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
          aria-hidden="true"
        />
      </div>

      {!mobile && (
        <div className={`border-t border-border p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <GradientButton
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            onClick={() => setCollapsed(!collapsed)}
            icon={<PanelLeftIcon size={15} className={collapsed ? 'rotate-180' : ''} />}
            className="w-full"
          >
            {!collapsed && t('common.collapse')}
          </GradientButton>
        </div>
      )}
    </nav>
  );
}

export function AppSidebar() {
  const { collapsed, mobileOpen, toggleMobile } = useContext(SidebarCtx);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);

    const handler = () => {
      if (mql.matches) {
        setMobileOpen(false);
      }
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <MobileSheet open={mobileOpen} onOpenChange={(v) => { if (!v) toggleMobile(); }} />

      <aside
        className={`hidden md:flex flex-col bg-card border-r border-border shadow-sm transition-[width] duration-300 overflow-hidden min-w-0 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
        aria-label="Sidebar"
      >
        <SidebarContent />
      </aside>
    </>
  );
}

function MobileSheet({ open }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toggleMobile } = useContext(SidebarCtx);

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) toggleMobile(); }}>
      <SheetContent side="left" className="w-64 p-0 bg-card">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SidebarContent mobile onNavigate={toggleMobile} />
      </SheetContent>
    </Sheet>
  );
}
