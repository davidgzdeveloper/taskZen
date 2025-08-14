"use client";

import { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Droppable } from "react-beautiful-dnd";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
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
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`bg-muted/50 rounded-lg p-2 min-h-[400px] transition-colors ${snapshot.isDraggingOver ? 'bg-accent/20' : ''}`}
          >
            {tasks.length > 0 ? (
              tasks.map((task, index) => <TaskCard key={task.id} task={task} index={index} />)
            ) : (
              <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Drop tasks here</p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
