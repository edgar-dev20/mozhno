import { useAuth } from '@/app/auth/useAuth';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  return {
    canWrite: role === 'admin' || role === 'developer',
    canManage: role === 'admin',
  };
}
