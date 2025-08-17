// Base types for our simplified schema
export interface User {
  id: string
  email: string
  password: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

// Extended types for API responses
export type UserWithTasks = User & {
  tasks: Task[]
}

export type TaskWithUser = Task & {
  user: User
}

// API request types
export interface CreateTaskRequest {
  title: string
  description?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string
}

export interface CreateProfileRequest {
  fullName?: string
  avatarUrl?: string
}

export interface UpdateProfileRequest {
  fullName?: string
  avatarUrl?: string
}

// Dashboard types
export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  totalScore: number
}

export interface TaskStats {
  byStatus: {
    todo: number
    inProgress: number
    done: number
  }
  byPriority: {
    low: number
    medium: number
    high: number
  }
}
