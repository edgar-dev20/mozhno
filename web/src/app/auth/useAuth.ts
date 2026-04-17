import { useContext } from 'react';
import { AuthContext } from '@/app/auth/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
