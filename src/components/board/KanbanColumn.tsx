
"use client";

import { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { useRef, useEffect, useState } from "react";
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

export function KanbanColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const cleanup = dropTargetForElements({
      element,
      getData() {
        return { columnId: column.id };
      },
      onDragEnter() {
        setIsDraggedOver(true);
      },
      onDragLeave() {
        setIsDraggedOver(false);
      },
      onDrop() {
        setIsDraggedOver(false);
      },
    });

    return cleanup;
  }, [column.id]);

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
      <div
        ref={ref}
        className={`bg-muted/50 rounded-lg p-4 min-h-[400px] transition-colors ${isDraggedOver ? 'bg-accent/20 border-2 border-primary border-dashed' : ''}`}
      >
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} columnId={column.id} />)
        ) : (
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
