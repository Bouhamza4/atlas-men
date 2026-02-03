'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export function useAdmin(options?: {
  redirectTo?: string;
  requireAdmin?: boolean;
}) {
  const {
    redirectTo = '/',
    requireAdmin = true,
  } = options || {};

  const router = useRouter();
  const auth = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);

      // Wait for auth to load
      if (auth.loading) return;

      // If not authenticated
      if (!auth.isAuthenticated) {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      // If admin required but user is not admin
      if (requireAdmin && !auth.isAdmin) {
        console.warn('Access denied: User is not admin');
        router.push(redirectTo);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAccess();
  }, [auth, router, redirectTo, requireAdmin]);

  return {
    ...auth,
    isAuthorized,
    isChecking,
    canAccess: isAuthorized && !isChecking,
  };
}