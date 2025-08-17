import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from './lib/auth'

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip auth for auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Get token from Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    )
  }

  // Verify token
  const payload = AuthService.verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  // Add user info to headers for API routes to use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: '/api/:path*',
}
