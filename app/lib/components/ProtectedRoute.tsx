'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  redirectTo?: string;
  showLoader?: boolean;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireModerator = false,
  redirectTo = '/auth/login',
  showLoader = true,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    isModerator,
  } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`;
      router.push(redirectUrl);
      return;
    }

    // Check admin access
    if (requireAdmin && !isAdmin) {
      router.push('/unauthorized');
      return;
    }

    // Check moderator access
    if (requireModerator && !isModerator) {
      router.push('/unauthorized');
      return;
    }
  }, [loading, isAuthenticated, isAdmin, isModerator, requireAuth, requireAdmin, requireModerator, router, redirectTo]);

  if (loading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg font-medium">Checking authentication...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we verify your access
          </p>
        </div>
      </div>
    );
  }

  // Check all conditions
  const canAccess = 
    (!requireAuth || isAuthenticated) &&
    (!requireAdmin || isAdmin) &&
    (!requireModerator || isModerator);

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Render children with auth data
  return <>{children}</>;
}