"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskPriority } from "@/lib/types";
import { Clock, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const priorityClasses: Record<TaskPriority, string> = {
  high: "border-l-4 border-destructive",
  medium: "border-l-4 border-accent",
  low: "border-l-4 border-primary/50",
};

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className={`mb-4 shadow-sm hover:shadow-md transition-shadow ${priorityClasses[task.priority]}`}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
            <p className="font-semibold text-base leading-tight mb-2">{task.title}</p>
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {task.completedPomodoros}/{task.estimatedPomodoros}
              </span>
            </div>
          </div>
           <Avatar className="h-6 w-6">
                <AvatarImage src="https://placehold.co/32x32" data-ai-hint="person face"/>
                <AvatarFallback>AD</AvatarFallback>
            </Avatar>
        </div>
      </CardContent>
    </Card>
  );
}
