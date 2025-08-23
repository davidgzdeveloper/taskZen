import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services/taskService'
import { UpdateTaskRequest } from '@/lib/types'
import { AuthService } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const task = await TaskService.getTaskById(params.id, userId)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Transform task to frontend format
    const transformedTask = {
      ...task,
      status: task.status.toLowerCase().replace('_', '-') as 'todo' | 'in-progress' | 'done',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high'
    }

    return NextResponse.json(transformedTask)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updates: UpdateTaskRequest = await request.json()
    
    // Transform frontend data to match database schema
    const transformedUpdates = {
      ...updates,
      status: updates.status?.toUpperCase().replace('-', '_') as 'TODO' | 'IN_PROGRESS' | 'DONE',
      priority: updates.priority?.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
    }
    
    const task = await TaskService.updateTask(params.id, userId, transformedUpdates)
    
    // Transform task back to frontend format
    const transformedTask = {
      ...task,
      status: task.status.toLowerCase().replace('_', '-') as 'todo' | 'in-progress' | 'done',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high'
    }
    
    return NextResponse.json(transformedTask)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await TaskService.deleteTask(params.id, userId)
    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status } = await request.json()
    if (!status || !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const task = await TaskService.moveTask(params.id, userId, status)
    return NextResponse.json(task)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
