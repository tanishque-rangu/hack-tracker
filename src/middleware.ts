import { NextResponse, type NextRequest } from 'next/server';
import { isEmailAuthorized } from '@/lib/auth/allowed-users';

// Public routes accessible without authentication
const PUBLIC_PATHS = ['/login', '/signup', '/auth/callback', '/robots.txt', '/sitemap.xml'];
const PUBLIC_PREFIXES = ['/_next', '/api/auth', '/auth', '/favicon.ico', '/ambiance'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets and login/signup pages
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) {
    return NextResponse.next();
  }

  // Check for session cookie or Supabase auth token
  const sessionCookie = request.cookies.get('squadsync_session')?.value;
  const sbToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('sb-auth-token')?.value;

  const authUserEmail = sessionCookie || sbToken;

  if (!authUserEmail) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Verify that the email is an authorized team member
  if (!isEmailAuthorized(authUserEmail)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // For /admin route, ensure user has admin role
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const adminEmails = ['koushikkatkam@gmail.com'];
    if (!adminEmails.includes(authUserEmail.toLowerCase())) {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('denied', 'admin_only');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
