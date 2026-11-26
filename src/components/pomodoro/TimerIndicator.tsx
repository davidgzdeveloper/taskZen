"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useTimer } from "@/contexts/TimerContext";
import { cn } from "@/lib/utils";

/** Compact timer in the header while a session is on and the user is on another page. */
export function TimerIndicator() {
  const { inSession, isActive, isBreak, formattedTime, toggle, selectedTask } = useTimer();
  const pathname = usePathname();
  const visible = inSession && pathname !== "/timer";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="flex items-center rounded-full border bg-card pl-1 pr-1"
        >
          <Link
            href="/timer"
            title={selectedTask ? `${isBreak ? "Descanso" : "Foco"}: ${selectedTask.title}` : undefined}
            className="flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-2 transition-colors hover:bg-muted"
          >
            <span
              aria-hidden
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                isBreak ? "bg-done" : "bg-focus",
                isActive ? "animate-pulse" : "opacity-50"
              )}
            />
            <span className="sr-only">{isBreak ? "Descanso" : "Sesión de foco"}, quedan</span>
            <span className="numeral text-lg font-semibold leading-none">{formattedTime}</span>
            {!isActive && <span className="text-xs text-muted-foreground">en pausa</span>}
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={isActive ? "Pausar" : "Reanudar"}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
