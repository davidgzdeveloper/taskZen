import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services/taskService'
import { CreateTaskRequest } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Get user from middleware headers
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    let tasks
    if (search) {
      tasks = await TaskService.searchTasks(userId, search)
    } else if (status) {
      tasks = await TaskService.getTasksByStatus(userId, status as any)
    } else if (priority) {
      tasks = await TaskService.getTasksByPriority(userId, priority as any)
    } else {
      tasks = await TaskService.getUserTasks(userId)
    }

    return NextResponse.json(tasks)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from middleware headers
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskData: CreateTaskRequest = await request.json()
    
    // Validate required fields
    if (!taskData.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const task = await TaskService.createTask(userId, taskData)
    return NextResponse.json(task, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
