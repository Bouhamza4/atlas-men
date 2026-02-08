'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { FiShield, FiLock } from 'react-icons/fi';

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
        {showLock && <FiLock className="lock-icon" />}
        <div className="admin-only-content">
          <h3>Admin Access Required</h3>
          <p>This content is only visible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-badge">
        <FiShield className="admin-icon" />
        <span>Admin View</span>
      </div>
      {children}
    </div>
  );
}