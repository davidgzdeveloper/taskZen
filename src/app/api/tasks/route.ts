import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services/taskService'
import { CreateTaskRequest } from '@/lib/types'
import { AuthService } from '@/lib/auth'

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

    // Transform tasks to frontend format
    const transformedTasks = tasks.map(task => ({
      ...task,
      status: task.status.toLowerCase().replace('_', '-') as 'todo' | 'in-progress' | 'done',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high'
    }))
    
    return NextResponse.json(transformedTasks)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const taskData: CreateTaskRequest = await request.json()
    
    // Validate required fields
    if (!taskData.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Transform frontend data to match database schema
    const transformedTaskData = {
      ...taskData,
      status: taskData.status?.toUpperCase() as 'TODO' | 'IN_PROGRESS' | 'DONE',
      priority: taskData.priority?.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
      estimatedPomodoros: (taskData as any).estimatedPomodoros || 1
    }

    const task = await TaskService.createTask(userId, transformedTaskData)
    
    // Transform task back to frontend format
    const transformedTask = {
      ...task,
      status: task.status.toLowerCase().replace('_', '-') as 'todo' | 'in-progress' | 'done',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high'
    }
    
    return NextResponse.json(transformedTask, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
