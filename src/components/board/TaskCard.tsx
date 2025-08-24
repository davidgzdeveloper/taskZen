
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task, TaskPriority } from "@/lib/types";
import { Clock, GripVertical, ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRef, useEffect, useState } from "react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const priorityClasses: Record<TaskPriority, string> = {
  high: "border-l-4 border-destructive",
  medium: "border-l-4 border-accent",
  low: "border-l-4 border-primary/50",
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
  const { session } = useAuth();

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

  const containerClasses = isMobile ? "mb-2" : "mb-4";
  const cardPadding = isMobile ? "p-2" : "p-3";
  const titleSize = isMobile ? "text-sm" : "text-base";
  const descriptionMargin = isMobile ? "mb-2" : "mb-3";

  const moveTask = async (targetColumn: string) => {
    try {
      if (!session) {
        toast({ 
          title: "Authentication Error", 
          description: "Please log in to move tasks.",
          variant: "destructive" 
        });
        return;
      }

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ status: targetColumn }),
      });
      if (!response.ok) throw new Error('Failed to move task');
      toast({ title: "Task Moved" });
      // Reload to reflect changes across the app
      window.location.reload();
    } catch (error) {
      toast({ title: "Move Failed", variant: "destructive" });
    }
  };

  const moveTaskLeft = () => {
    let targetColumn = '';
    if (columnId === 'in-progress') targetColumn = 'todo';
    else if (columnId === 'done') targetColumn = 'in-progress';
    if (targetColumn) moveTask(targetColumn);
  };

  const moveTaskRight = () => {
    let targetColumn = '';
    if (columnId === 'todo') targetColumn = 'in-progress';
    else if (columnId === 'in-progress') targetColumn = 'done';
    if (targetColumn) moveTask(targetColumn);
  };

  // Helper functions for mobile buttons
  const canMoveLeft = columnId !== 'todo';
  const canMoveRight = columnId !== 'done';
  const getLeftButtonLabel = () => {
    if (columnId === 'in-progress') return 'To Do';
    if (columnId === 'done') return 'In Progress';
    return '';
  };
  const getRightButtonLabel = () => {
    if (columnId === 'todo') return 'In Progress';
    if (columnId === 'in-progress') return 'Done';
    return '';
  };

  return (
    <div
      ref={ref}
      className={containerClasses}
      style={{ 
        cursor: isMobile ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.2s ease, opacity 0.2s ease'
      }}
    >
      <Card className={`shadow-sm hover:shadow-md transition-shadow ${priorityClasses[task.priority]} ${isDragging ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className={cardPadding}>
          <div className="flex justify-between items-start">
            <p className={`font-semibold ${titleSize} leading-tight mb-2 pr-2`}>{task.title}</p>
            {!isMobile && (
              <div className="cursor-grab p-1 flex-shrink-0">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          {task.description && (
            <p className={`text-xs ${isMobile ? 'text-muted-foreground/80' : 'text-muted-foreground'} ${descriptionMargin} ${isMobile ? 'line-clamp-2' : ''}`}>
              {task.description}
            </p>
          )}
          <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground ${isMobile ? 'mb-2' : ''}`}>
            <div className="flex items-center gap-1">
              <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span>
                {task.completedPomodoros}/{task.estimatedPomodoros}
              </span>
            </div>
            <Avatar className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`}>
              <AvatarImage src="https://placehold.co/32x32" data-ai-hint="person face" />
              <AvatarFallback className={`${isMobile ? 'text-xs' : 'text-sm'}`}>AD</AvatarFallback>
            </Avatar>
          </div>
          
          {/* Mobile action buttons */}
          {isMobile && (
            <div className="flex items-center gap-1 mt-2">
              {canMoveLeft && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs flex items-center gap-1"
                  onClick={moveTaskLeft}
                >
                  <ArrowLeft className="h-3 w-3" />
                  {getLeftButtonLabel()}
                </Button>
              )}
              {canMoveRight && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs flex items-center gap-1"
                  onClick={moveTaskRight}
                >
                  {getRightButtonLabel()}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs flex items-center gap-1 ml-auto"
                onClick={() => {/* TODO: Navigate to timer */}}
              >
                <Play className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
