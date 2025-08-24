import { prisma } from '@/lib/prisma'
import { CreateTaskRequest, UpdateTaskRequest, Task, ColumnId, TaskPriority } from '@/lib/types'
import { TaskStatus, Priority } from '@prisma/client'

// Mapping functions between database enums and frontend types
const mapColumnIdToTaskStatus = (columnId: ColumnId): TaskStatus => {
  const mapping: Record<ColumnId, TaskStatus> = {
    'todo': 'TODO',
    'in-progress': 'IN_PROGRESS',
    'done': 'DONE'
  }
  return mapping[columnId]
}

const mapTaskStatusToColumnId = (status: TaskStatus): ColumnId => {
  const mapping: Record<TaskStatus, ColumnId> = {
    'TODO': 'todo',
    'IN_PROGRESS': 'in-progress',
    'DONE': 'done'
  }
  return mapping[status]
}

const mapTaskPriorityToPriority = (priority: TaskPriority): Priority => {
  const mapping: Record<TaskPriority, Priority> = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH'
  }
  return mapping[priority]
}

const mapPriorityToTaskPriority = (priority: Priority): TaskPriority => {
  const mapping: Record<Priority, TaskPriority> = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high'
  }
  return mapping[priority]
}

// Transform database task to frontend task
const transformTask = (dbTask: any): Task => ({
  ...dbTask,
  status: mapTaskStatusToColumnId(dbTask.status),
  priority: mapPriorityToTaskPriority(dbTask.priority)
})

export class TaskService {
  // Create a new task
  static async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    const dbTask = await prisma.task.create({
      data: {
        ...taskData,
        status: taskData.status ? mapColumnIdToTaskStatus(taskData.status) : 'TODO',
        priority: taskData.priority ? mapTaskPriorityToPriority(taskData.priority) : 'MEDIUM',
        userId,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      },
    })
    return transformTask(dbTask)
  }

  // Get all tasks for a user
  static async getUserTasks(userId: string): Promise<Task[]> {
    const dbTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [
        { createdAt: 'desc' },
        { priority: 'desc' },
      ],
    })
    return dbTasks.map(transformTask)
  }

  // Get tasks by status
  static async getTasksByStatus(userId: string, status: ColumnId): Promise<Task[]> {
    const dbTasks = await prisma.task.findMany({
      where: { 
        userId,
        status: mapColumnIdToTaskStatus(status) 
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    return dbTasks.map(transformTask)
  }

  // Get a single task by ID
  static async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    const dbTask = await prisma.task.findFirst({
      where: { 
        id: taskId,
        userId 
      },
    })
    return dbTask ? transformTask(dbTask) : null
  }

  // Update a task
  static async updateTask(taskId: string, userId: string, updates: UpdateTaskRequest): Promise<Task> {
    const dbTask = await prisma.task.update({
      where: { 
        id: taskId,
        userId 
      },
      data: {
        ...updates,
        status: updates.status ? mapColumnIdToTaskStatus(updates.status) : undefined,
        priority: updates.priority ? mapTaskPriorityToPriority(updates.priority) : undefined,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
        updatedAt: new Date(),
      },
    })
    return transformTask(dbTask)
  }

  // Delete a task
  static async deleteTask(taskId: string, userId: string): Promise<void> {
    await prisma.task.delete({
      where: { 
        id: taskId,
        userId 
      },
    })
  }

  // Move task between statuses
  static async moveTask(taskId: string, userId: string, newStatus: ColumnId): Promise<Task> {
    const dbTask = await prisma.task.update({
      where: { 
        id: taskId,
        userId 
      },
      data: {
        status: mapColumnIdToTaskStatus(newStatus),
        updatedAt: new Date(),
      },
    })
    return transformTask(dbTask)
  }

  // Get task statistics for dashboard
  static async getTaskStats(userId: string) {
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'DONE' } }),
      prisma.task.count({ where: { userId, status: 'TODO' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
    ])

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      totalScore: completedTasks * 10, // Simple scoring system
    }
  }

  // Get tasks by priority
  static async getTasksByPriority(userId: string, priority: TaskPriority): Promise<Task[]> {
    const dbTasks = await prisma.task.findMany({
      where: { 
        userId,
        priority: mapTaskPriorityToPriority(priority) 
      },
      orderBy: { createdAt: 'desc' },
    })
    return dbTasks.map(transformTask)
  }

  // Search tasks
  static async searchTasks(userId: string, query: string): Promise<Task[]> {
    const dbTasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
    return dbTasks.map(transformTask)
  }
}
