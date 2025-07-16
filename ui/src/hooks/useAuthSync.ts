'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, logout } from '@/store/slices/authSlice';

/**
 * Hook to sync NextAuth session with Redux state
 * This ensures both authentication systems stay in sync
 */
export function useAuthSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const reduxAuthState = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (session?.user && !reduxAuthState.isAuthenticated) {
      // NextAuth has a session but Redux doesn't - sync it
      dispatch(login({
        id: (session.user as any).id || '1',
        email: session.user.email || '',
        name: session.user.name || '',
        role: (session.user as any).role || 'user'
      }));
    } else if (!session && reduxAuthState.isAuthenticated) {
      // NextAuth has no session but Redux does - clear Redux
      dispatch(logout());
    }
  }, [session, status, reduxAuthState.isAuthenticated, dispatch]);

  return {
    session,
    status,
    isAuthenticated: reduxAuthState.isAuthenticated,
    user: reduxAuthState.user
  };
}
