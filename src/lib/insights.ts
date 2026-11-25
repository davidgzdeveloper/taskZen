import { Task } from './types'

/**
 * Deterministic numbers about the user's work, computed in code so the
 * assistant interprets real figures instead of doing arithmetic itself.
 */

const DAY_MS = 24 * 60 * 60 * 1000
/** An in-progress task untouched for this long counts as stalled. */
const STALLED_AFTER_DAYS = 5

export interface TaskInsight {
  title: string
  status: Task['status']
  priority: Task['priority']
  estimatedPomodoros: number
  completedPomodoros: number
  focusMinutes: number
  /** Pomodoros beyond the estimate (0 when on or under it). */
  overrunPomodoros: number
  /** Calendar days from creation to completion, for finished tasks. */
  daysToComplete?: number
  /** Days since the task was last updated. */
  daysSinceUpdate: number
}

export interface WorkInsights {
  pomodoroMinutes: number
  totals: {
    tasks: number
    todo: number
    inProgress: number
    done: number
    focusMinutes: number
  }
  /** Tasks with the most focus time, any status. */
  mostTime: TaskInsight[]
  /** Tasks that took more pomodoros than estimated. */
  overruns: TaskInsight[]
  inProgress: TaskInsight[]
  /** In-progress tasks with no updates in STALLED_AFTER_DAYS days. */
  stalled: TaskInsight[]
  /** Unfinished tasks with at most one pomodoro left. */
  nearlyDone: TaskInsight[]
  highPriorityTodo: TaskInsight[]
}

export function computeInsights(tasks: Task[], pomodoroMinutes = 25, now = new Date()): WorkInsights {
  const all: TaskInsight[] = tasks.map((t) => {
    const completed = t.completedPomodoros || 0
    const estimated = t.estimatedPomodoros || 1
    const created = new Date(t.createdAt)
    return {
      title: t.title,
      status: t.status,
      priority: t.priority,
      estimatedPomodoros: estimated,
      completedPomodoros: completed,
      focusMinutes: completed * pomodoroMinutes,
      overrunPomodoros: Math.max(0, completed - estimated),
      daysToComplete: t.completedAt
        ? Math.max(0, Math.round((new Date(t.completedAt).getTime() - created.getTime()) / DAY_MS))
        : undefined,
      daysSinceUpdate: Math.round((now.getTime() - new Date(t.updatedAt).getTime()) / DAY_MS),
    }
  })

  const byTime = (a: TaskInsight, b: TaskInsight) => b.focusMinutes - a.focusMinutes
  const open = all.filter((t) => t.status !== 'done')
  const inProgress = all.filter((t) => t.status === 'in-progress')

  return {
    pomodoroMinutes,
    totals: {
      tasks: all.length,
      todo: all.filter((t) => t.status === 'todo').length,
      inProgress: inProgress.length,
      done: all.filter((t) => t.status === 'done').length,
      focusMinutes: all.reduce((sum, t) => sum + t.focusMinutes, 0),
    },
    mostTime: all.filter((t) => t.focusMinutes > 0).sort(byTime).slice(0, 5),
    overruns: all
      .filter((t) => t.overrunPomodoros > 0)
      .sort((a, b) => b.overrunPomodoros - a.overrunPomodoros)
      .slice(0, 5),
    inProgress: inProgress.sort(byTime).slice(0, 8),
    stalled: inProgress.filter((t) => t.daysSinceUpdate >= STALLED_AFTER_DAYS).slice(0, 5),
    nearlyDone: open
      .filter((t) => t.completedPomodoros > 0 && t.estimatedPomodoros - t.completedPomodoros <= 1)
      .slice(0, 5),
    highPriorityTodo: open.filter((t) => t.priority === 'high').slice(0, 5),
  }
}
