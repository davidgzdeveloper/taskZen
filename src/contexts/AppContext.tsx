"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { BoardState, Task, TaskPriority, ColumnId } from '@/lib/types';

// Define the new, simplified context type
interface AppContextType {
  board: BoardState;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'columnOrder' | 'status' | 'completedPomodoros'>, userId: string) => void;
  updateTask: (task: Task) => void;
  updateTasks: (tasks: Task[]) => void;
  // handleDragEnd has been removed as it was using a non-existent dependency
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const initialBoard: BoardState = {
  tasks: {},
  columns: {
    todo: { id: 'todo', title: 'To Do', taskIds: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
    done: { id: 'done', title: 'Done', taskIds: [] },
  },
  columnOrder: ['todo', 'in-progress', 'done'],
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<BoardState>(initialBoard);

  // Note: This addTask function is client-side only and does not persist to the database.
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'columnOrder' | 'status'| 'completedPomodoros'>, userId: string) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
        ...taskData,
        id: newTaskId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
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

  return (
    <AppContext.Provider value={{ board, addTask, updateTask, updateTasks }}>
      {children}
    </AppContext.Provider>
  );
};