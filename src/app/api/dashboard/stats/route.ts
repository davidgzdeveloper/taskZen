import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services/taskService'
import { AuthService } from '@/lib/auth'

// Force Node.js runtime for bcryptjs compatibility
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = await AuthService.getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = user.id

    const stats = await TaskService.getTaskStats(userId)
    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
