import { prisma } from '@/lib/prisma'
import { CreateTaskRequest, UpdateTaskRequest, Task } from '@/lib/types'

export class TaskService {
  // Create a new task
  static async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    return await prisma.task.create({
      data: {
        ...taskData,
        userId,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      },
    })
  }

  // Get all tasks for a user
  static async getUserTasks(userId: string): Promise<Task[]> {
    return await prisma.task.findMany({
      where: { userId },
      orderBy: [
        { createdAt: 'desc' },
        { priority: 'desc' },
      ],
    })
  }

  // Get tasks by status
  static async getTasksByStatus(userId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE'): Promise<Task[]> {
    return await prisma.task.findMany({
      where: { 
        userId,
        status 
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  }

  // Get a single task by ID
  static async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    return await prisma.task.findFirst({
      where: { 
        id: taskId,
        userId 
      },
    })
  }

  // Update a task
  static async updateTask(taskId: string, userId: string, updates: UpdateTaskRequest): Promise<Task> {
    return await prisma.task.update({
      where: { 
        id: taskId,
        userId 
      },
      data: {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
        updatedAt: new Date(),
      },
    })
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
  static async moveTask(taskId: string, userId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE'): Promise<Task> {
    return await prisma.task.update({
      where: { 
        id: taskId,
        userId 
      },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    })
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
  static async getTasksByPriority(userId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<Task[]> {
    return await prisma.task.findMany({
      where: { 
        userId,
        priority 
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Search tasks
  static async searchTasks(userId: string, query: string): Promise<Task[]> {
    return await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
