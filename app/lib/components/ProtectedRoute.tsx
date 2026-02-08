'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { FiAlertTriangle, FiLoader } from 'react-icons/fi';

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
      <div className="loading-container">
        <div className="loading-content">
          <FiLoader className="spinner-icon" />
          <p className="loading-text">Checking authentication...</p>
          <p className="loading-subtext">
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
      <div className="access-denied-container">
        <div className="access-denied-content">
          <FiAlertTriangle className="denied-icon" />
          <h1 className="denied-title">Access Denied</h1>
          <p className="denied-description">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.push('/')}
            className="denied-button"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}