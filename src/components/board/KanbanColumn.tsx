
"use client";

import { Column, ColumnId, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { useRef, useEffect, useState } from "react";
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { cn } from "@/lib/utils";

const statusDot: Record<ColumnId, string> = {
  todo: "border-[1.5px] border-muted-foreground/60",
  "in-progress": "bg-primary",
  done: "bg-done",
};

const emptyCopy: Record<ColumnId, string> = {
  todo: "Crea una tarea para empezar.",
  "in-progress": "Arrastra aquí la tarea en la que vas a trabajar.",
  done: "Las tareas terminadas aparecerán aquí.",
};

export function KanbanColumn({ column, tasks, isMobile = false }: { column: Column; tasks: Task[]; isMobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Only enable drop target on desktop (not mobile)
    if (!isMobile) {
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
    }
  }, [column.id, isMobile]);

  return (
    <div className={isMobile ? "w-full" : "w-full md:w-80 lg:w-96 flex-shrink-0"}>
      <div className="mb-3 flex items-center gap-2.5 px-1">
        <span aria-hidden className={cn("h-2.5 w-2.5 rounded-full", statusDot[column.id])} />
        <h2 className="text-lg font-semibold">{column.title}</h2>
        <span className="numeral text-lg text-muted-foreground">{tasks.length}</span>
      </div>
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-secondary/70 p-2 transition-colors",
          isMobile ? "min-h-[120px]" : "min-h-[420px]",
          isDraggedOver && "bg-accent ring-2 ring-primary/50"
        )}
      >
        {tasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={column.id}
                isMobile={isMobile}
              />
            ))}
          </div>
        ) : (
          <p className={cn("px-3 text-sm text-muted-foreground", isMobile ? "py-6" : "py-10")}>
            {emptyCopy[column.id]}
          </p>
        )}
      </div>
    </div>
  );
}
