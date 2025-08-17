import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services/taskService'

export async function GET(request: NextRequest) {
  try {
    // Get user from middleware headers
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await TaskService.getTaskStats(userId)
    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
