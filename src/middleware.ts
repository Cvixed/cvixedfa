import { NextResponse, type NextRequest } from 'next/server';
import { validateSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/manifest.json' ||
    pathname === '/offline.html' ||
    pathname === '/logo.svg' ||
    pathname === '/favicon.ico' ||
    pathname === '/icon' ||
    pathname === '/apple-icon'
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = await validateSessionToken(sessionCookie);

  // If already authenticated and trying to go to auth screen or legacy login, redirect to dashboard
  if (isAuthenticated && (pathname === '/auth/totp' || pathname === '/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If visiting the TOTP authentication page, allow access
  if (pathname === '/auth/totp') {
    return NextResponse.next();
  }

  // If visiting legacy login, redirect to totp auth page
  if (pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/totp';
    return NextResponse.redirect(url);
  }

  // If not authenticated, redirect to Google Authenticator unlock page
  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/totp';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
