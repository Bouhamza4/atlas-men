import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async (cookieStore?: ReturnType<typeof cookies>) => {
  // ✅ Get cookies async
  const cookieData = cookieStore 
    ? await Promise.resolve(cookieStore) 
    : await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieData.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieData.set(name, value, options)
            );
          } catch (error) {
            console.error('Error setting cookies:', error);
          }
        },
      },
    }
  );
};

export async function getServerUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

export async function getServerProfile() {
  try {
    const user = await getServerUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return profile;
  } catch (error) {
    console.error('Error getting server profile:', error);
    return null;
  }
}

export async function requireAuth(
  request: Request,
  requireAdmin = false
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Location': `/auth/login?redirect=${encodeURIComponent(new URL(request.url).pathname)}`
          }
        }
      );
    }

    if (requireAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden - Admin access required' }),
          { 
            status: 403,
            headers: {
              'Location': '/unauthorized'
            }
          }
        );
      }
    }

    return null;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}