export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string;
  createdAt: Date;
  preferences: {
    pomodoroWork: number;
    pomodoroBreak: number;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  stats: {
    totalScore: number;
    tasksCompleted: number;
    pomodorosCompleted: number;
    currentStreak: number;
    bestStreak: number;
    lastActiveDate: Date;
  };
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  columnOrder: number;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId: string;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  type: 'work' | 'break';
  duration: number; // in seconds
  startedAt: Date;
  completedAt?: Date;
  wasInterrupted: boolean;
  userId: string;
}

export interface DailyStats {
  date: string; // 'YYYY-MM-DD'
  tasksCompleted: number;
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  score: number;
  userId: string;
}

export type ColumnId = TaskStatus;

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: string[];
}

export interface BoardState {
  tasks: Record<string, Task>;
  columns: Record<ColumnId, Column>;
  columnOrder: ColumnId[];
}
