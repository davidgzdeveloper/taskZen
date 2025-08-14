
"use client";

import { useAppContext } from "@/hooks/useAppContext";
import { KanbanColumn } from "./KanbanColumn";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { Button } from "../ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { runPrioritizeTasks } from "@/lib/actions";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

export const KanbanBoard = () => {
  const { board, updateTasks, handleDragEnd } = useAppContext();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event);
  };
  
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
    <DndContext onDragEnd={onDragEnd} sensors={sensors}>
        <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Kanban Board</h1>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleOptimize} disabled={isOptimizing}>
                    {isOptimizing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Optimize with AI
                </Button>
                <CreateTaskDialog />
            </div>
        </div>
        <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 pb-4">
            {board.columnOrder.map(columnId => {
                const column = board.columns[columnId];
                const tasks = column.taskIds.map(taskId => board.tasks[taskId]);
                return (
                <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={tasks as Task[]}
                />
                );
            })}
            </div>
        </div>
        </div>
    </DndContext>
  );
}
