"use client";

import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { PomodoroPips } from "@/components/PomodoroPips";
import { cn } from "@/lib/utils";

const ESTIMATE = 4;
const STEP_MS = 900;

type DemoColumn = "todo" | "doing" | "done";

const columns: { id: DemoColumn; title: string }[] = [
  { id: "todo", title: "Por hacer" },
  { id: "doing", title: "En curso" },
  { id: "done", title: "Hecho" },
];

const staticTasks = [
  { id: "stats", column: "todo" as DemoColumn, title: "Repasar tema 4 de estadística", done: 0, total: 3 },
  { id: "invoices", column: "done" as DemoColumn, title: "Enviar facturas de noviembre", done: 2, total: 2 },
];

/**
 * The landing's one moving moment: a task fills its pomodoros one by one,
 * then moves to "Hecho". Plays once; reduced-motion users see the end state.
 */
export function HeroDemo() {
  const reduceMotion = useReducedMotion();
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setCompleted(ESTIMATE);
      return;
    }
    if (completed >= ESTIMATE) return;
    const id = setTimeout(() => setCompleted((c) => c + 1), completed === 0 ? 1900 : STEP_MS);
    return () => clearTimeout(id);
  }, [completed, reduceMotion]);

  const featuredColumn: DemoColumn = completed >= ESTIMATE ? "done" : "doing";

  return (
    <div
      aria-label="Ejemplo de tablero: una tarea completa sus cuatro pomodoros y pasa a Hecho"
      role="img"
      className="rounded-2xl border bg-secondary/60 p-3 sm:p-4"
    >
      <LayoutGroup>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-2">
              <p className="px-1 text-sm font-semibold text-muted-foreground">{col.title}</p>
              <div className="flex min-h-[4.5rem] flex-col gap-2 sm:min-h-[11rem]">
                {staticTasks
                  .filter((t) => t.column === col.id)
                  .map((t) => (
                    <DemoCard key={t.id} title={t.title} done={t.done} total={t.total} finished={col.id === "done"} />
                  ))}
                {featuredColumn === col.id && (
                  <DemoCard
                    layoutId="featured"
                    title="Escribir propuesta para el cliente"
                    done={completed}
                    total={ESTIMATE}
                    running={completed < ESTIMATE}
                    finished={col.id === "done"}
                    highlight
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}

function DemoCard({
  title,
  done,
  total,
  running = false,
  finished = false,
  highlight = false,
  layoutId,
}: {
  title: string;
  done: number;
  total: number;
  running?: boolean;
  finished?: boolean;
  highlight?: boolean;
  layoutId?: string;
}) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn(
        "rounded-lg border bg-card p-3 text-left",
        highlight && !finished && "border-focus/60",
      )}
    >
      <p className={cn("text-sm font-medium leading-snug", finished && "text-muted-foreground line-through decoration-done/60")}>
        {title}
      </p>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <PomodoroPips done={done} total={total} size="sm" running={running} />
        <span className="digits text-xs text-muted-foreground">
          {done}/{total}
        </span>
      </div>
    </motion.div>
  );
}
