import { cn } from "@/lib/utils";

const sizes = {
  sm: { dot: "h-2 w-2", gap: "gap-1" },
  md: { dot: "h-2.5 w-2.5", gap: "gap-1.5" },
  lg: { dot: "h-4 w-4", gap: "gap-2" },
};

interface PomodoroPipsProps {
  done: number;
  total: number;
  size?: keyof typeof sizes;
  /** Highlights the pip currently being worked on. */
  running?: boolean;
  className?: string;
}

/**
 * A task's estimate shown as a row of focus sessions.
 * Filled pips are completed pomodoros; extra sessions beyond the estimate
 * are drawn in the same row so overruns stay visible.
 */
export function PomodoroPips({ done, total, size = "md", running = false, className }: PomodoroPipsProps) {
  const count = Math.max(total, done, 1);
  const { dot, gap } = sizes[size];

  return (
    <span
      role="img"
      aria-label={`${done} de ${total} pomodoros`}
      className={cn("inline-flex flex-wrap items-center", gap, className)}
    >
      {Array.from({ length: count }, (_, i) => {
        const filled = i < done;
        const current = running && i === done;
        const over = i >= total;
        return (
          <span
            key={i}
            // A pip pops in when it becomes filled; on first paint they cascade.
            style={filled ? { animationDelay: `${Math.min(i, 8) * 45}ms` } : undefined}
            className={cn(
              "rounded-full transition-colors duration-300",
              dot,
              filled
                ? cn("animate-pip-fill", over ? "bg-destructive" : "bg-focus")
                : "border-[1.5px] border-muted-foreground/40",
              current && "border-focus bg-focus/30 animate-pulse"
            )}
          />
        );
      })}
    </span>
  );
}
