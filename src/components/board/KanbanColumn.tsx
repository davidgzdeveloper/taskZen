
"use client";

import { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useMemo } from "react";

export function KanbanColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  return (
    <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {column.title}
          <span className="text-sm font-normal bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </h2>
      </div>
      <SortableContext items={taskIds}>
        <div
          ref={setNodeRef}
          className={`bg-muted/50 rounded-lg p-2 min-h-[400px] transition-colors ${isOver ? 'bg-accent/20' : ''}`}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Drop tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
