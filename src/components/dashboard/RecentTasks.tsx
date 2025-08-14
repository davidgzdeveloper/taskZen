"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Task, TaskPriority } from "@/lib/types";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

const priorityVariant: Record<TaskPriority, "destructive" | "secondary" | "default"> = {
  high: "destructive",
  medium: "secondary",
  low: "default",
};

export function RecentTasks({ tasks }: { tasks: Task[] }) {
    const recentTasks = useMemo(() => {
        return tasks
            .filter(task => task.status === 'done' && task.completedAt)
            .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
            .slice(0, 5);
    }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Completed Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {recentTasks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant[task.priority]} className="capitalize">
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(task.completedAt!), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No tasks completed recently.</p>
        )}
      </CardContent>
    </Card>
  );
}
