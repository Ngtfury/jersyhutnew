import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifySessionToken } from './lib/adminAuth';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Read admin session cookie
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  const token = sessionCookie?.value;
  const isAuthenticated = token ? await verifySessionToken(token) : false;

  // Case 1: Navigating to /admin/login
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    if (isAuthenticated) {
      // Already authenticated, forward to dashboard
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Case 2: Navigating to protected /admin routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isAuthenticated) {
      // Unauthorized, redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
