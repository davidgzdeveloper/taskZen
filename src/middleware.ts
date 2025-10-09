import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Normalize pathname to remove trailing slash for consistent matching
  const normalizedPathname = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const isAuthenticated = !!token;

  const publicPaths = ['/', '/login', '/signup', '/landing'];
  const isPublicPath = publicPaths.includes(normalizedPathname);

  // If the user is authenticated and on a public path, redirect to dashboard
  if (isAuthenticated && isPublicPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is not authenticated and tries to access a private path,
  // redirect them to the login page.
  if (!isAuthenticated && !isPublicPath) {
    // Allow landing page access even if it's not explicitly in publicPaths
    if (pathname.startsWith('/landing')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Otherwise, allow the request to proceed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}