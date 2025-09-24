"use client";

import { useAuth } from '@/contexts/AuthContext';

export const useAppContext = () => {
  const context = useAuth();
  return {
    board: context.board,
    addTask: context.addTask as (taskData: any, userId: string) => Promise<void>,
    updateTask: context.updateTask as (taskId: string, updates: Partial<Task>) => void,
    updateTasks: context.updateTasks,
    moveTask: context.moveTask,
    user: context.user,
  };
};
