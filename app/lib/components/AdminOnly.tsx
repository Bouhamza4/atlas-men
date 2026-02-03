'use client';

import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, Lock } from 'lucide-react';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  showLock?: boolean;
}

export default function AdminOnly({ 
  children, 
  fallback,
  showLock = true 
}: AdminOnlyProps) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="admin-only-fallback">
        {showLock && <Lock className="lock-icon" />}
        <div className="admin-only-content">
          <h3>Admin Access Required</h3>
          <p>This content is only visible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-badge">
        <Shield size={14} />
        <span>Admin View</span>
      </div>
      {children}
    </>
  );
}