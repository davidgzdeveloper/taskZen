
"use client";

import { Button } from "@/components/ui/button";
import { ColumnId, Task, TaskPriority } from "@/lib/types";
import { GripVertical, ArrowLeft, ArrowRight } from "lucide-react";
import { PomodoroPips } from "@/components/PomodoroPips";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const priorityLabel: Record<TaskPriority, { text: string; className: string }> = {
  high: { text: "Alta", className: "text-destructive font-semibold" },
  medium: { text: "Media", className: "text-muted-foreground" },
  low: { text: "Baja", className: "text-muted-foreground/70" },
};

interface TaskCardProps {
  task: Task;
  columnId: string;
  isMobile?: boolean;
}

export function TaskCard({ task, columnId, isMobile = false }: TaskCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { session, moveTask: moveTaskInBoard } = useAuth();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Only enable drag & drop on desktop (not mobile)
    if (!isMobile) {
      const cleanup = draggable({
        element,
        getInitialData() {
          return { taskId: task.id, columnId };
        },
        onDragStart() {
          setIsDragging(true);
        },
        onDrop() {
          setIsDragging(false);
        },
      });

      return cleanup;
    }
  }, [task.id, columnId, isMobile]);

  const moveTask = async (targetColumn: ColumnId) => {
    // Move locally first so the card slides right away; revert if the server refuses.
    moveTaskInBoard(task.id, columnId as ColumnId, targetColumn);
    try {
      if (!session) {
        moveTaskInBoard(task.id, targetColumn, columnId as ColumnId);
        toast({
          title: "Sesión caducada",
          description: "Inicia sesión de nuevo para mover tareas.",
          variant: "destructive"
        });
        return;
      }

      // Convert frontend status format to backend format
      const statusMap: Record<string, string> = {
        'todo': 'TODO',
        'in-progress': 'IN_PROGRESS',
        'done': 'DONE'
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ status: statusMap[targetColumn] }),
      });
      if (!response.ok) throw new Error('Failed to move task');
      toast({ title: "Tarea movida" });
    } catch (error) {
      moveTaskInBoard(task.id, targetColumn, columnId as ColumnId);
      toast({ title: "No se pudo mover la tarea", description: "La tarea ha vuelto a su columna. Inténtalo de nuevo.", variant: "destructive" });
    }
  };

  const moveTaskLeft = () => {
    let targetColumn: ColumnId | '' = '';
    if (columnId === 'in-progress') targetColumn = 'todo';
    else if (columnId === 'done') targetColumn = 'in-progress';
    if (targetColumn) moveTask(targetColumn);
  };

  const moveTaskRight = () => {
    let targetColumn: ColumnId | '' = '';
    if (columnId === 'todo') targetColumn = 'in-progress';
    else if (columnId === 'in-progress') targetColumn = 'done';
    if (targetColumn) moveTask(targetColumn);
  };

  // Helper functions for mobile buttons
  const canMoveLeft = columnId !== 'todo';
  const canMoveRight = columnId !== 'done';
  const getLeftButtonLabel = () => {
    if (columnId === 'in-progress') return 'Por hacer';
    if (columnId === 'done') return 'En curso';
    return '';
  };
  const getRightButtonLabel = () => {
    if (columnId === 'todo') return 'En curso';
    if (columnId === 'in-progress') return 'Hecho';
    return '';
  };

  const isDone = columnId === 'done';
  const priority = priorityLabel[task.priority];

  return (
    <motion.div
      ref={ref}
      layoutId={task.id}
      layout="position"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className={cn(
        "group rounded-lg border bg-card p-3",
        !isMobile && (isDragging ? "cursor-grabbing ring-2 ring-primary" : "cursor-grab hover:border-input")
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("font-medium leading-snug", isDone && "text-muted-foreground line-through decoration-done/60")}>
          {task.title}
        </p>
        {!isMobile && (
          <GripVertical aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />
        )}
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <PomodoroPips
            done={task.completedPomodoros || 0}
            total={task.estimatedPomodoros || 1}
            size="sm"
          />
          <span className="digits text-muted-foreground">
            {task.completedPomodoros || 0}/{task.estimatedPomodoros}
          </span>
        </div>
        <span className={priority.className}>{priority.text}</span>
      </div>

      {/* Mobile: move between columns with buttons instead of drag & drop */}
      {isMobile && (canMoveLeft || canMoveRight) && (
        <div className="mt-3 flex items-center gap-2">
          {canMoveLeft && (
            <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5" onClick={moveTaskLeft}>
              <ArrowLeft className="h-3.5 w-3.5" />
              {getLeftButtonLabel()}
            </Button>
          )}
          {canMoveRight && (
            <Button variant="outline" size="sm" className="ml-auto h-8 gap-1 px-2.5" onClick={moveTaskRight}>
              {getRightButtonLabel()}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
