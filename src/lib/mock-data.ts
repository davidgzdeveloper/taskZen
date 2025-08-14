import { User, BoardState, Task } from './types';

export const mockUser: User = {
  uid: '12345',
  email: 'user@taskzen.com',
  displayName: 'Alex Doe',
  photoURL: 'https://placehold.co/100x100',
  createdAt: new Date('2023-01-15T09:00:00Z'),
  preferences: {
    pomodoroWork: 25,
    pomodoroBreak: 5,
    theme: 'light',
    notifications: true,
  },
  stats: {
    totalScore: 1250,
    tasksCompleted: 50,
    pomodorosCompleted: 200,
    currentStreak: 5,
    bestStreak: 12,
    lastActiveDate: new Date(),
  },
};

const tasks: Task[] = [
    { id: 'task-1', title: 'Design the new dashboard layout', description: 'Create mockups in Figma.', status: 'todo', priority: 'high', columnOrder: 0, estimatedPomodoros: 4, completedPomodoros: 0, createdAt: new Date(), updatedAt: new Date(), userId: '12345' },
    { id: 'task-2', title: 'Develop API for user authentication', description: 'Use JWT for authentication.', status: 'inprogress', priority: 'high', columnOrder: 0, estimatedPomodoros: 6, completedPomodoros: 2, createdAt: new Date(), updatedAt: new Date(), userId: '12345' },
    { id: 'task-3', title: 'Fix bug in the notification system', description: 'Notifications are not being sent on mobile.', status: 'inprogress', priority: 'medium', columnOrder: 1, estimatedPomodoros: 2, completedPomodoros: 0, createdAt: new Date(), updatedAt: new Date(), userId: '12345' },
    { id: 'task-4', title: 'Write documentation for the API', description: 'Use Swagger for documentation.', status: 'todo', priority: 'medium', columnOrder: 1, estimatedPomodoros: 3, completedPomodoros: 0, createdAt: new Date(), updatedAt: new Date(), userId: '12345' },
    { id: 'task-5', title: 'Deploy the staging environment', description: 'Use Firebase Hosting.', status: 'done', priority: 'high', columnOrder: 0, estimatedPomodoros: 2, completedPomodoros: 2, createdAt: new Date(), updatedAt: new Date(), completedAt: new Date(), userId: '12345' },
    { id: 'task-6', title: 'Onboard new team member', description: 'Prepare intro documents.', status: 'todo', priority: 'low', columnOrder: 2, estimatedPomodoros: 2, completedPomodoros: 0, createdAt: new Date(), updatedAt: new Date(), userId: '12345' },
    { id: 'task-7', title: 'Update dependencies', description: 'Check for security vulnerabilities.', status: 'done', priority: 'low', columnOrder: 1, estimatedPomodoros: 1, completedPomodoros: 1, createdAt: new Date(), updatedAt: new Date(), completedAt: new Date(), userId: '12345' },
    { id: 'task-8', title: 'Refactor old codebase', description: 'Improve performance and readability.', status: 'todo', priority: 'medium', columnOrder: 3, estimatedPomodoros: 8, completedPomodoros: 0, createdAt: new Date(), updatedAt: new Date(), userId: '12345' },
];

const tasksById = tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
}, {} as Record<string, Task>);


export const mockBoard: BoardState = {
  tasks: tasksById,
  columns: {
    todo: {
      id: 'todo',
      title: 'To Do',
      taskIds: tasks.filter(t => t.status === 'todo').map(t => t.id),
    },
    inprogress: {
      id: 'inprogress',
      title: 'In Progress',
      taskIds: tasks.filter(t => t.status === 'inprogress').map(t => t.id),
    },
    done: {
      id: 'done',
      title: 'Done',
      taskIds: tasks.filter(t => t.status === 'done').map(t => t.id),
    },
  },
  columnOrder: ['todo', 'inprogress', 'done'],
};

export const mockDailyStats = [
    { date: '2024-07-15', tasksCompleted: 3, pomodorosCompleted: 6, score: 75 },
    { date: '2024-07-16', tasksCompleted: 2, pomodorosCompleted: 4, score: 50 },
    { date: '2024-07-17', tasksCompleted: 4, pomodorosCompleted: 8, score: 100 },
    { date: '2024-07-18', tasksCompleted: 1, pomodorosCompleted: 2, score: 25 },
    { date: '2024-07-19', tasksCompleted: 5, pomodorosCompleted: 10, score: 125 },
    { date: '2024-07-20', tasksCompleted: 2, pomodorosCompleted: 4, score: 50 },
    { date: '2024-07-21', tasksCompleted: 3, pomodorosCompleted: 5, score: 65 },
];
