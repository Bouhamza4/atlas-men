import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export const createClient = async (
  cookieStoreParam?: ReturnType<typeof cookies> | Promise<ReturnType<typeof cookies>>
) => {
  const cookieStore = cookieStoreParam
    ? (await cookieStoreParam) as ReturnType<typeof cookies>
    : await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            console.error('Error setting cookies:', error);
          }
        },
      },
    }
  );
};

export async function getServerUser(cookieStore?: ReturnType<typeof cookies>) {
  const supabase = await createClient(cookieStore);
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  
  return user;
}

export async function getServerProfile(cookieStore?: ReturnType<typeof cookies>) {
  const user = await getServerUser(cookieStore);
  if (!user) return null;

  const supabase = await createClient(cookieStore);
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return profile;
}

export async function requireAuth(
  request: NextRequest,
  requireAdmin = false
) {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.redirect(
      new URL(`/auth/login?redirect=${encodeURIComponent(request.nextUrl.pathname)}`, request.url)
    );
  }

  if (requireAdmin) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const profileTyped = profile as { role?: string } | null;
    if (profileError || !profileTyped || profileTyped.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return null;
}