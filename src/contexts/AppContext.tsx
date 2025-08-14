
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, BoardState, Task, TaskPriority, ColumnId } from '@/lib/types';
import { mockUser, mockBoard } from '@/lib/mock-data';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface AppContextType {
  user: User | null;
  board: BoardState;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'columnOrder' | 'status' | 'completedPomodoros'>) => void;
  updateTask: (task: Task) => void;
  updateTasks: (tasks: Task[]) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [board, setBoard] = useState<BoardState>(mockBoard);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate checking auth status on mount
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setUser(mockUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    console.log('Logging in with', email, pass);
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate API call
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setIsLoading(false);
  };

  const logout = () => {
    setIsLoading(true);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setIsLoading(false);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'columnOrder' | 'status'| 'completedPomodoros'>) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
        ...taskData,
        id: newTaskId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user?.uid || '12345',
        status: 'todo',
        columnOrder: board.columns.todo.taskIds.length,
        completedPomodoros: 0,
    };

    setBoard(prevBoard => {
        const newTasks = {
            ...prevBoard.tasks,
            [newTaskId]: newTask
        };
        const newTodoColumn = {
            ...prevBoard.columns.todo,
            taskIds: [...prevBoard.columns.todo.taskIds, newTaskId]
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
       
      // Sort tasks in 'todo' column based on new priorities
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = board.tasks[activeId];
    if (!activeTask) return;

    const startColumnId = activeTask.status;
    // over.id can be a column id or a task id
    const endColumnId = (board.columns[overId] ? overId : board.tasks[overId]?.status) as ColumnId;

    if (!startColumnId || !endColumnId) return;

    if (startColumnId === endColumnId) {
      // Reordering within the same column
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
              taskIds: arrayMove(column.taskIds, oldIndex, newIndex),
            },
          },
        }));
      }
    } else {
      // Moving to a different column
      const startColumn = board.columns[startColumnId];
      const endColumn = board.columns[endColumnId];

      const startTaskIds = startColumn.taskIds.filter(id => id !== activeId);
      
      const overIsAColumn = board.columns[overId];
      const newEndTaskIds = [...endColumn.taskIds];
      
      if (overIsAColumn) {
        // Dropped on a column
        newEndTaskIds.push(activeId);
      } else {
        // Dropped on a task
        const overIndex = endColumn.taskIds.indexOf(overId);
        newEndTaskIds.splice(overIndex, 0, activeId);
      }
      
      setBoard(prev => {
        const newTasks = {
            ...prev.tasks,
            [activeId]: {
                ...prev.tasks[activeId],
                status: endColumnId,
                updatedAt: new Date(),
                ...(endColumnId === 'done' && { completedAt: new Date() })
            }
        };

        return {
          ...prev,
          tasks: newTasks,
          columns: {
            ...prev.columns,
            [startColumnId]: {
              ...startColumn,
              taskIds: startTaskIds
            },
            [endColumnId]: {
              ...endColumn,
              taskIds: newEndTaskIds
            }
          }
        }
      })
    }
  };


  return (
    <AppContext.Provider value={{ user, board, isAuthenticated, isLoading, login, logout, addTask, updateTask, updateTasks, handleDragEnd }}>
      {children}
    </AppContext.Provider>
  );
};
