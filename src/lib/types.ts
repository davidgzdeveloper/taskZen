// Base types for our simplified schema
export interface UserStats {
  currentStreak: number;
  totalScore: number;
}

export interface User {
  id: string
  email: string
  password: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
  preferences: UserPreferences
  stats: UserStats
}

export type TaskPriority = 'low' | 'medium' | 'high';

export type ColumnId = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string
  title: string
  description: string | null
  status: ColumnId
  priority: TaskPriority
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
  columnOrder: number
  completedPomodoros: number
  estimatedPomodoros: number
  completedAt?: Date
}

export interface Column {
    id: ColumnId;
    title: string;
    taskIds: string[];
}
  
export interface BoardState {
    tasks: { [key: string]: Task };
    columns: { [key: string]: Column };
    columnOrder: ColumnId[];
}
  
export interface UserPreferences {
    theme: 'light' | 'dark';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  status?: ColumnId
  priority?: TaskPriority
  dueDate?: string
  estimatedPomodoros?: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: ColumnId
  priority?: TaskPriority
  dueDate?: string
  completedPomodoros?: number
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