"use client";

import { Task, TaskPriority } from "@/lib/types";
import { useMemo } from "react";
import { motion } from "framer-motion";

// Priority is ordinal, so it uses one hue stepped light → dark.
const levels: { key: TaskPriority; label: string; className: string }[] = [
  { key: "high", label: "Alta", className: "bg-primary" },
  { key: "medium", label: "Media", className: "bg-primary/55" },
  { key: "low", label: "Baja", className: "bg-primary/25" },
];

interface PriorityPieChartProps {
  tasks: Task[];
}

/** Share of tasks per priority, as a single stacked bar with a legend. */
export function PriorityPieChart({ tasks }: PriorityPieChartProps) {
  const counts = useMemo(() => {
    const c: Record<TaskPriority, number> = { high: 0, medium: 0, low: 0 };
    tasks.forEach(task => {
      if (task.priority) c[task.priority]++;
    });
    return c;
  }, [tasks]);

  const total = counts.high + counts.medium + counts.low;

  return (
    <section aria-labelledby="priority-title" className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 id="priority-title" className="text-xl font-semibold">Tareas por prioridad</h2>
      {total === 0 ? (
        <p className="mt-3 text-muted-foreground">Crea tareas en el tablero para ver cómo se reparten.</p>
      ) : (
        <>
          <div className="mt-5 flex h-4 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden>
            {levels.filter(l => counts[l.key] > 0).map((l, i) => (
              <motion.div
                key={l.key}
                title={`${l.label}: ${counts[l.key]}`}
                className={l.className}
                initial={{ width: 0 }}
                animate={{ width: `${(counts[l.key] / total) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-4">
            {levels.map(l => (
              <div key={l.key}>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${l.className}`} />
                  {l.label}
                </dt>
                <dd className="numeral mt-1 text-2xl font-semibold">
                  {counts[l.key]}
                  <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                    {Math.round((counts[l.key] / total) * 100)}%
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}
