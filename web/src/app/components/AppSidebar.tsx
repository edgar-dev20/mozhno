import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useT, type MessageKey } from '@/i18n';
import { useAuth } from '@/app/auth/useAuth';
import { Wordmark } from '@/shared/components/Wordmark';
import { Hairline } from '@/shared/components/Hairline';
import { GradientButton } from '@/shared/components/GradientButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { PanelLeftIcon } from 'lucide-react';
import { OVERVIEW_ITEMS, MANAGEMENT_ITEMS, TEAM_ITEMS, SETTINGS_ITEMS } from '@/app/components/navConfig';
import type { NavItem } from '@/app/components/navConfig';
import { PluginSlot } from '@/app/components/PluginSlot';

const SIDEBAR_COOKIE = 'sidebar_state';
const MOBILE_BP = 768;

const SidebarCtx = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleMobile: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {}, toggleMobile: () => {}, mobileOpen: false, setMobileOpen: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export function useAppSidebar() {
  return useContext(SidebarCtx);
}

export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.cookie.includes(`${SIDEBAR_COOKIE}=true`);
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    document.cookie = `${SIDEBAR_COOKIE}=${v}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B' || e.code === 'KeyB')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.innerWidth < MOBILE_BP) {
          setMobileOpen((o) => !o);
        } else {
          setCollapsedState((c) => {
            const next = !c;
            document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
            return next;
          });
        }
      }
    };
    document.addEventListener('keydown', handler, { capture: true });
    return () => document.removeEventListener('keydown', handler, { capture: true });
  }, []);

  return (
    <SidebarCtx.Provider value={{ collapsed, setCollapsed, toggleMobile, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarCtx.Provider>
  );
}

function NavLinkItem({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const { pathname } = useLocation();
  const t = useT();
  const Icon = item.icon;
  const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);

  const link = (
    <NavLink
      to={item.path}
      end={item.exact}
      onClick={onClick}
      className={({ isActive: active }) =>
        `flex items-center gap-3 rounded-lg transition-all duration-200 text-body-sm font-medium w-full text-left px-3 py-2.5 ${
          active
            ? 'bg-accent shadow-sm font-semibold text-brand'
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

function SidebarContent({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { collapsed, setCollapsed } = useContext(SidebarCtx);
  const t = useT();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
  const shortcutKey = isMac ? '⌘B' : 'Ctrl+B';

  return (
    <nav aria-label="Navigation" className="flex flex-col h-full">
      <div
        className={`h-14 flex items-center border-b border-border transition-all ${collapsed && !mobile ? 'justify-center px-2' : 'px-5'}`}
      >
        {collapsed && !mobile ? (
          <Wordmark text="м" size="sm" />
        ) : (
          <Wordmark text="можно" size="md" />
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-1 overflow-y-auto py-3 px-3">
          {OVERVIEW_ITEMS.map((item) => (
            <NavLinkItem
              key={item.path}
              item={item}
              collapsed={collapsed && !mobile}
              onClick={onNavigate}
            />
          ))}

          {collapsed && !mobile ? null : <Hairline className="my-3" />}
          <div
            className={`${collapsed && !mobile ? 'sr-only' : 'px-3 mb-1.5 text-overline font-semibold text-muted-foreground uppercase tracking-wider'}`}
          >
            {t('navigation.management')}
          </div>
          {MANAGEMENT_ITEMS.map((item) => (
            <NavLinkItem
              key={item.path}
              item={item}
              collapsed={collapsed && !mobile}
              onClick={onNavigate}
            />
          ))}

          {isAdmin && (
            <>
              {collapsed && !mobile ? null : <Hairline className="my-3" />}
              <div
                className={`${collapsed && !mobile ? 'sr-only' : 'px-3 mb-1.5 text-overline font-semibold text-muted-foreground uppercase tracking-wider'}`}
              >
                {t('navigation.team')}
              </div>
              {TEAM_ITEMS.map((item) => (
                <NavLinkItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed && !mobile}
                  onClick={onNavigate}
                />
              ))}

              {collapsed && !mobile ? null : <Hairline className="my-3" />}
              <div
                className={`${collapsed && !mobile ? 'sr-only' : 'px-3 mb-1.5 text-overline font-semibold text-muted-foreground uppercase tracking-wider'}`}
              >
                {t('navigation.settingsGroup')}
              </div>
              {SETTINGS_ITEMS.map((item) => (
                <NavLinkItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed && !mobile}
                  onClick={onNavigate}
                />
              ))}
              <PluginSlot slotId="sidebar.admin" />
            </>
          )}
        </div>
      </div>

      {!mobile && (
        <div className={`border-t border-border p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <GradientButton
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            onClick={() => setCollapsed(!collapsed)}
            icon={<PanelLeftIcon size={15} className={collapsed ? 'rotate-180' : ''} />}
            className="w-full"
            title={collapsed ? shortcutKey : undefined}
          >
            {!collapsed && (
              <span className="flex items-center gap-2">
                <span>{t('common.collapse')}</span>
                <kbd className="text-[10px] font-medium text-muted-foreground/50 bg-muted px-1 py-0.5 rounded leading-none">
                  {shortcutKey}
                </kbd>
              </span>
            )}
          </GradientButton>
        </div>
      )}
    </nav>
  );
}

export function AppSidebar() {
  const { collapsed, mobileOpen, toggleMobile, setMobileOpen } = useContext(SidebarCtx);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);

    const handler = () => {
      if (mql.matches) {
        setMobileOpen(false);
      }
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setMobileOpen]);

  return (
    <>
      <MobileSheet
        open={mobileOpen}
        onOpenChange={(v) => {
          if (!v) toggleMobile();
        }}
      />

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
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) toggleMobile();
      }}
    >
      <SheetContent side="left" className="w-64 p-0 bg-card">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SidebarContent mobile onNavigate={toggleMobile} />
      </SheetContent>
    </Sheet>
  );
}
