import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthContext';

const adminRoutes = ['/users', '/integrations', '/settings', '/audit', '/apikeys'];

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="text-neutral-500">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && adminRoutes.some(r => location.pathname.startsWith(r))) {
    return <Navigate to="/flags" replace />;
  }

  return <Outlet />;
}