"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, BoardState, Task, TaskPriority, ColumnId } from '@/lib/types';
import { mockUser, mockBoard } from '@/lib/mock-data';

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
  handleDragEnd: (result: any) => void;
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

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = board.columns[source.droppableId as ColumnId];
    const finish = board.columns[destination.droppableId as ColumnId];
    const draggedTask = board.tasks[draggableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newState = {
        ...board,
        columns: {
          ...board.columns,
          [newColumn.id]: newColumn,
        },
      };
      setBoard(newState);
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };
    
    const newTasks = {
        ...board.tasks,
        [draggableId]: {
            ...draggedTask,
            status: destination.droppableId,
            updatedAt: new Date(),
            ...(destination.droppableId === 'done' && { completedAt: new Date() })
        }
    }

    const newState = {
      ...board,
      tasks: newTasks,
      columns: {
        ...board.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    setBoard(newState);
  };


  return (
    <AppContext.Provider value={{ user, board, isAuthenticated, isLoading, login, logout, addTask, updateTask, updateTasks, handleDragEnd }}>
      {children}
    </AppContext.Provider>
  );
};
