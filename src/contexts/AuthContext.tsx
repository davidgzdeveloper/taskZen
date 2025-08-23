'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { ProfileService } from '@/lib/services/profileService'
import { useRouter } from 'next/navigation'
import { UserPreferences } from '@prisma/client'
import { BoardState, Task, TaskPriority, ColumnId } from '@/lib/types'

// Define a more complete User type for the context
interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
  preferences: UserPreferences | null
}

interface Session {
  user: User
  token: string
}

// Combined context type that includes both auth and app functionality
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: { fullName?: string; avatarUrl?: string }) => Promise<{ error?: string }>
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<{ error?: string }>
  // App state management
  board: BoardState
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'columnOrder' | 'status' | 'completedPomodoros'>, userId: string) => Promise<void>
  updateTask: (task: Task) => void
  updateTasks: (tasks: Task[]) => void
  handleDragEnd: (event: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initial board state
const initialBoard: BoardState = {
  tasks: {},
  columns: {
    todo: { id: 'todo', title: 'To Do', taskIds: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
    done: { id: 'done', title: 'Done', taskIds: [] },
  },
  columnOrder: ['todo', 'in-progress', 'done'],
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState<BoardState>(initialBoard)
  const router = useRouter();

  // Client-side cache for auth data
  const [authCache, setAuthCache] = useState<{
    token: string;
    user: User;
    expires: number;
  } | null>(null);

  // Helper function to fetch user with preferences - optimized to batch requests
  const fetchUserWithPreferences = async (baseUser: Omit<User, 'preferences'>, token: string) => {
    try {
      // Check cache first
      if (authCache && authCache.token === token && Date.now() < authCache.expires) {
        setUser(authCache.user);
        setSession({ user: authCache.user, token });
        return;
      }

      const res = await fetch('/api/user/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch preferences');
      const preferences: UserPreferences = await res.json();
      
      const fullUser = { ...baseUser, preferences };
      
      // Cache for 10 minutes
      setAuthCache({
        token,
        user: fullUser,
        expires: Date.now() + (10 * 60 * 1000)
      });
      
      setUser(fullUser);
      setSession({ user: fullUser, token });
    } catch (error) {
      console.error("Failed to load user preferences, using user without them.", error);
      const fallbackUser = { ...baseUser, preferences: null };
      setUser(fallbackUser);
      setSession({ user: fallbackUser, token });
    }
  }

  // Load tasks from database
  const loadTasks = async (token: string) => {
    try {
      const response = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const tasks = await response.json();
        
        // Transform tasks array into board format
        const tasksById: Record<string, Task> = {};
        const todoIds: string[] = [];
        const inProgressIds: string[] = [];
        const doneIds: string[] = [];
        
        tasks.forEach((task: Task) => {
          tasksById[task.id] = task;
          switch (task.status) {
            case 'todo':
              todoIds.push(task.id);
              break;
            case 'in-progress':
              inProgressIds.push(task.id);
              break;
            case 'done':
              doneIds.push(task.id);
              break;
          }
        });
        
        setBoard({
          tasks: tasksById,
          columns: {
            todo: { id: 'todo', title: 'To Do', taskIds: todoIds },
            'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: inProgressIds },
            done: { id: 'done', title: 'Done', taskIds: doneIds },
          },
          columnOrder: ['todo', 'in-progress', 'done'],
        });
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      // Check cache first for faster startup
      if (authCache && authCache.token === token && Date.now() < authCache.expires) {
        setUser(authCache.user);
        setSession({ user: authCache.user, token });
        setLoading(false);
        // Load tasks after setting user
        loadTasks(token);
        return;
      }

      fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          // User already includes preferences from the batched API call
          const fullUser = data.user;
          
          // Cache the complete user data
          setAuthCache({
            token,
            user: fullUser,
            expires: Date.now() + (10 * 60 * 1000)
          });
          
          setUser(fullUser);
          setSession({ user: fullUser, token });
          
          // Load tasks after setting user
          loadTasks(token);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        Cookies.remove('token')
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      })
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.error) {
        return { error: data.error }
      }

      Cookies.set('token', data.token, { expires: 7, path: '/' })
      await fetchUserWithPreferences(data.user, data.token); // Fetch preferences on sign-in
      router.push('/dashboard')

      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (data.error) {
        return { error: data.error }
      }

      Cookies.set('token', data.token, { expires: 7, path: '/' })
      await fetchUserWithPreferences(data.user, data.token); // Fetch preferences on sign-up
      router.push('/dashboard'); // Also redirect on sign-up

      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const signOut = async () => {
    Cookies.remove('token')
    setUser(null)
    setSession(null)
    router.push('/login');
  }

  const updateProfile = async (updates: { fullName?: string; avatarUrl?: string }) => {
    try {
      if (!user) return { error: 'User not authenticated' };

      const updatedUserFromService = await ProfileService.updateUserProfile(user.id, updates);

      const updatedUserForState = {
        ...updatedUserFromService,
        createdAt: new Date(updatedUserFromService.createdAt).toISOString(),
        updatedAt: new Date(updatedUserFromService.updatedAt).toISOString(),
      };

      // Keep existing preferences
      setUser({ ...user, ...updatedUserForState });

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    try {
        if (!session) return { error: 'User not authenticated' };

        const response = await fetch('/api/user/preferences', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(preferences)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update preferences');
        }

        const updatedPreferences = await response.json();

        // Update user state with new preferences
        if (user) {
            setUser({ ...user, preferences: updatedPreferences });
        }

        return {};
    } catch (error: any) {
        return { error: error.message };
    }
  };

  // App state management functions
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'columnOrder' | 'status'| 'completedPomodoros'>, userId: string) => {
    try {
      if (!session) return;

      // Call API to create task in database
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();

      // Update local state with the task from database
      setBoard(prevBoard => {
        const newTasks = {
          ...prevBoard.tasks,
          [newTask.id]: newTask
        };
        const newTodoColumn = {
          ...prevBoard.columns.todo,
          taskIds: [...prevBoard.columns.todo.taskIds, newTask.id]
        };
        return {
          ...prevBoard,
          tasks: newTasks,
          columns: {
            ...prevBoard.columns,
            todo: newTodoColumn
          }
        };
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTask = (updatedTask: Task) => {
    setBoard(prevBoard => {
      const newTasks = {
        ...prevBoard.tasks,
        [updatedTask.id]: updatedTask,
      };
      return { ...prevBoard, tasks: newTasks };
    });
  };
  
  const updateTasks = (updatedTasks: Task[]) => {
    setBoard(prevBoard => {
      const newTasks = { ...prevBoard.tasks };
      const priorityMap: Record<string, TaskPriority> = {};
      
      updatedTasks.forEach(task => {
        if(newTasks[task.id]) {
          newTasks[task.id] = { ...newTasks[task.id], ...task };
          priorityMap[task.id] = task.priority;
        }
      });
       
      const todoColumn = prevBoard.columns.todo;
      const sortedTaskIds = [...todoColumn.taskIds].sort((a, b) => {
          const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
          const priorityA = priorityMap[a] || newTasks[a].priority;
          const priorityB = priorityMap[b] || newTasks[b].priority;
          return priorityOrder[priorityA] - priorityOrder[priorityB];
      });

      return {
        ...prevBoard,
        tasks: newTasks,
        columns: {
          ...prevBoard.columns,
          todo: {
            ...todoColumn,
            taskIds: sortedTaskIds
          }
        }
      };
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = board.tasks[activeId];
    if (!activeTask) return;

    const startColumnId = activeTask.status;
    const endColumnId = (board.columns[overId] ? overId : board.tasks[overId]?.status) as ColumnId;

    if (!startColumnId || !endColumnId) return;

    if (startColumnId === endColumnId) {
      const column = board.columns[startColumnId];
      const oldIndex = column.taskIds.indexOf(activeId);
      const newIndex = column.taskIds.indexOf(overId);

      if (oldIndex !== newIndex) {
        setBoard(prev => ({
          ...prev,
          columns: {
            ...prev.columns,
            [startColumnId]: {
              ...column,
              taskIds: (() => {
                const newTaskIds = [...column.taskIds];
                const [removed] = newTaskIds.splice(oldIndex, 1);
                newTaskIds.splice(newIndex, 0, removed);
                return newTaskIds;
              })(),
            },
          },
        }));
      }
    } else {
      // Moving between columns - update status in database
      try {
        if (!session) return;

        const response = await fetch(`/api/tasks/${activeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify({
            status: endColumnId,
            ...(endColumnId === 'done' && { completedAt: new Date() })
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update task');
        }

        const updatedTask = await response.json();

        // Update local state
        const startColumn = board.columns[startColumnId];
        const endColumn = board.columns[endColumnId];
        const startTaskIds = startColumn.taskIds.filter(id => id !== activeId);
        const newEndTaskIds = [...endColumn.taskIds];
        
        if (board.columns[overId]) {
          newEndTaskIds.push(activeId);
        } else {
          const overIndex = endColumn.taskIds.indexOf(overId);
          newEndTaskIds.splice(overIndex, 0, activeId);
        }
        
        setBoard(prev => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [activeId]: updatedTask
          },
          columns: {
            ...prev.columns,
            [startColumnId]: { ...startColumn, taskIds: startTaskIds },
            [endColumnId]: { ...endColumn, taskIds: newEndTaskIds }
          }
        }));
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateUserPreferences,
    board,
    addTask,
    updateTask,
    updateTasks,
    handleDragEnd,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}