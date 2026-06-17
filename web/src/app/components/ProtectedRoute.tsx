import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/app/auth/useAuth';
import { useT } from '@/i18n';

const adminRoutes = ['/users', '/integrations', '/settings', '/audit', '/apikeys'];

export function ProtectedRoute() {
  const t = useT();
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse" />
          <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && adminRoutes.some((r) => location.pathname.startsWith(r))) {
    return <Navigate to="/flags" replace />;
  }

  return <Outlet />;
}
