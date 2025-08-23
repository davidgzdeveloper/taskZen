import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

// Force Node.js runtime for bcryptjs compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sign in user
    const result = await AuthService.signIn(email, password)

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: result.user,
      token: result.token,
      message: 'Signed in successfully'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

