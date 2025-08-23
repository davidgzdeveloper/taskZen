"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { BoardState, Task, TaskPriority, ColumnId } from '@/lib/types';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// Define the new, simplified context type
interface AppContextType {
  board: BoardState;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'columnOrder' | 'status' | 'completedPomodoros'>, userId: string) => void;
  updateTask: (task: Task) => void;
  updateTasks: (tasks: Task[]) => void;
  handleDragEnd: (event: DragEndEvent) => void;
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

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'columnOrder' | 'status'| 'completedPomodoros'>, userId: string) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
        ...taskData,
        id: newTaskId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId, // Use the provided userId
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

  const handleDragEnd = (event: DragEndEvent) => {
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
              taskIds: arrayMove(column.taskIds, oldIndex, newIndex),
            },
          },
        }));
      }
    } else {
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
            [startColumnId]: { ...startColumn, taskIds: startTaskIds },
            [endColumnId]: { ...endColumn, taskIds: newEndTaskIds }
          }
        }
      })
    }
  };

  return (
    <AppContext.Provider value={{ board, addTask, updateTask, updateTasks, handleDragEnd }}>
      {children}
    </AppContext.Provider>
  );
};