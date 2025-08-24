"use client";

import { useAuth } from '@/contexts/AuthContext';

export const useAppContext = () => {
  const context = useAuth();
  return {
    board: context.board,
    addTask: context.addTask as (taskData: any, userId: string) => Promise<void>,
    updateTask: context.updateTask,
    updateTasks: context.updateTasks,
    user: context.user,
  };
};
