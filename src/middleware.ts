import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files (anything with a file extension)
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redirect /landing to the root page for consolidation
  if (pathname === '/landing') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const token = request.cookies.get('token')?.value;

  // Normalize pathname to remove trailing slash for consistent matching
  const normalizedPathname = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const isAuthenticated = !!token;

  // Define public paths
  const publicPaths = ['/', '/login', '/signup'];
  const isPublicPath = publicPaths.includes(normalizedPathname);

  // If the user is authenticated and on a public path, redirect to the dashboard
  if (isAuthenticated && isPublicPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is not authenticated and tries to access a private path, redirect to the login page
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Otherwise, allow the request to proceed
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
