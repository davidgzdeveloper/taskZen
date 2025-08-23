
"use client";

import { useAppContext } from "@/hooks/useAppContext";
import { KanbanColumn } from "./KanbanColumn";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { Button } from "../ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { runPrioritizeTasks } from "@/lib/actions";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

export const KanbanBoard = () => {
  const { board, updateTasks, handleDragEnd } = useAppContext();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: async ({ source, location }) => {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const taskId = source.data.taskId as string;
        const destinationColumnId = destination.data.columnId as ColumnId;
        
        if (!taskId || !destinationColumnId) return;
        
        const task = board.tasks[taskId];
        if (task && task.status === destinationColumnId) return; // No change

        // Persist change to backend
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: destinationColumnId }),
            });

            if (!response.ok) throw new Error('Failed to update task');
            
            const updatedTask = await response.json();

            // Update local state to reflect the change
            updateTasks([updatedTask]);

            toast({
                title: "Task Updated",
                description: "Task moved to the new column.",
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not move the task.",
                variant: "destructive",
            });
        }
      }
    });

    return cleanup;
  }, [board, updateTasks, toast]);
  
  const handleOptimize = async () => {
    setIsOptimizing(true);
    const tasksToPrioritize = board.columns.todo.taskIds.map(id => board.tasks[id]);
    
    try {
      const prioritizedTasks = await runPrioritizeTasks(tasksToPrioritize as Task[]);
      updateTasks(prioritizedTasks as Task[]);
      toast({
        title: "Tasks Optimized!",
        description: "Your 'To Do' list has been prioritized by AI.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Could not prioritize tasks at this time.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Kanban Board</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleOptimize} 
            disabled={isOptimizing}
            className="w-full sm:w-auto"
          >
            {isOptimizing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Optimize with AI</span>
            <span className="sm:hidden">AI Optimize</span>
          </Button>
          <CreateTaskDialog />
        </div>
      </div>

      {/* Board - responsive layout */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile: Vertical stack */}
        <div className="block md:hidden space-y-6">
          {board.columnOrder.map(columnId => {
            const column = board.columns[columnId];
            const tasks = column.taskIds.map(taskId => board.tasks[taskId]);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasks as Task[]}
                isMobile={true}
              />
            );
          })}
        </div>
        
        {/* Tablet & Desktop: Horizontal layout */}
        <div className="hidden md:flex md:gap-4 lg:gap-6 h-full overflow-x-auto pb-4">
          {board.columnOrder.map(columnId => {
            const column = board.columns[columnId];
            const tasks = column.taskIds.map(taskId => board.tasks[taskId]);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasks as Task[]}
                isMobile={false}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
