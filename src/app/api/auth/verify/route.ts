import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify token and get user with preferences in a single query
    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Batch fetch user preferences with the user data
    let preferences = null;
    try {
      preferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id }
      });
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }

    return NextResponse.json({ 
      user: {
        ...user,
        preferences
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

