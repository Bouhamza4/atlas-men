'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';

interface AuthContextType extends ReturnType<typeof useAuth> {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}