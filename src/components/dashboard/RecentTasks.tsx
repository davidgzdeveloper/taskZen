"use client";

import { Task } from "@/lib/types";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { PomodoroPips } from "@/components/PomodoroPips";

export function RecentTasks({ tasks }: { tasks: Task[] }) {
    const recentTasks = useMemo(() => {
        return tasks
            .filter(task => task.status === 'done' && task.completedAt)
            .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
            .slice(0, 5);
    }, [tasks]);

  return (
    <section aria-labelledby="recent-title" className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 id="recent-title" className="text-xl font-semibold">Terminadas hace poco</h2>
      {recentTasks.length > 0 ? (
        <ul className="mt-4 divide-y">
          {recentTasks.map(task => (
            <li key={task.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="font-medium">{task.title}</span>
              <span className="flex items-center gap-3 text-sm text-muted-foreground">
                <PomodoroPips done={task.completedPomodoros || 0} total={task.estimatedPomodoros || 1} size="sm" />
                {formatDistanceToNow(new Date(task.completedAt!), { addSuffix: true, locale: es })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-muted-foreground">Cuando muevas una tarea a Hecho, aparecerá aquí.</p>
      )}
    </section>
  );
}
