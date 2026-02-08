'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

// Profile type definition
type Profile = {
  id: string;
  email: string | null;
  role: 'user' | 'admin' | 'moderator';
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
};

type AuthState = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
};

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  const refreshUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: null,
        });
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      let profile = null;
      if (user) {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Profile fetch error:', profileError);
        }

        profile = profileData as Profile | null;

        // ✅ FIX: Update last_login with proper TypeScript handling
        if (user && profile) {
          try {
            await supabase
              .from('profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', user.id);
          } catch (updateError) {
            console.warn('Failed to update last_login:', updateError);
          }
        }
      }

      setState({
        user,
        profile,
        session,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('Auth refresh error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser();
          
          // Redirect after sign in
          if (event === 'SIGNED_IN' && pathname.startsWith('/auth')) {
            router.push('/admin');
          }
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
          router.push('/auth/login');
        } else if (event === 'USER_UPDATED') {
          await refreshUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [refreshUser, router, pathname]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prev => ({ ...prev, error: error as Error }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [router]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        profile: data as Profile,
      }));

      return data as Profile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, [state.user]);

  const isAuthenticated = !!state.user;
  const isAdmin = state.profile?.role === 'admin';
  const isModerator = state.profile?.role === 'moderator' || state.profile?.role === 'admin';

  return {
    ...state,
    refreshUser,
    signOut,
    updateProfile,
    isAuthenticated,
    isAdmin,
    isModerator,
  };
}