import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/app/lib/utils/auth';
import { cookies } from 'next/headers';


// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/auth/callback',
  '/api/auth/callback',
  '/api/webhooks',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

// Admin routes that require admin role
const adminRoutes = [
  '/admin',
  '/admin/**',
  '/api/admin/**',
];

// Protected routes (require authentication)
const protectedRoutes = [
  '/dashboard',
  '/dashboard/**',
  '/profile',
  '/settings',
  '/api/user/**',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    route === pathname || 
    (route.endsWith('**') && pathname.startsWith(route.slice(0, -3)))
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get cookies from request
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  // Get user session
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no user and route is protected, redirect to login
  if ((!user || error) && 
      (protectedRoutes.some(route => pathname.startsWith(route)) || 
       adminRoutes.some(route => pathname.startsWith(route)))) {
    
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin routes
  const isAdminRoute = adminRoutes.some(route => 
    route === pathname || 
    (route.endsWith('**') && pathname.startsWith(route.slice(0, -3)))
  );

  if (isAdminRoute && user) {
    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Add headers for authenticated requests
  const response = NextResponse.next();
  
  if (user) {
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-email', user.email || '');
  }

  return response;
}

// middleware.ts → proxy.ts


export default function proxy(request: NextRequest) {
  // إضافة headers للأمان
  const response = NextResponse.next();
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
