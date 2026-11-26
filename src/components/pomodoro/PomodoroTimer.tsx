"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/hooks/useAppContext";
import { useTimer } from "@/contexts/TimerContext";
import { Task } from "@/lib/types";
import { Play, Pause, RotateCcw, Moon, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ZenMode } from "./ZenMode";
import React, { useState, useEffect, useMemo } from "react";
import { PomodoroPips } from "@/components/PomodoroPips";
import { cn } from "@/lib/utils";

const presets = [15, 25, 45];

/** The timer page. The session itself lives in TimerContext so it survives navigation. */
export function PomodoroTimer() {
  const { board } = useAppContext();
  const {
    isBreak,
    isActive,
    formattedTime,
    progress,
    duration,
    setDuration,
    selectedTaskId,
    setSelectedTaskId,
    selectedTask,
    toggle,
    reset,
    testChime,
  } = useTimer();
  const [zen, setZen] = useState(false);

  // /timer?zen=1 opens straight into zen mode (linked from the dashboard).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("zen") === "1") setZen(true);
  }, []);

  const tasks = useMemo(() => Object.values(board.tasks).filter(t => t.status !== "done"), [board.tasks]) as Task[];

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-6 text-center sm:py-10">
      <motion.p
        key={isBreak ? "break" : "work"}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("text-lg font-semibold", isBreak ? "text-done" : "text-muted-foreground")}
      >
        {isBreak ? 'Descanso' : 'Sesión de foco'}
      </motion.p>

      <p
        role="timer"
        aria-live="off"
        className="numeral mt-2 text-[6.5rem] font-bold leading-none sm:text-[10rem]"
      >
        {formattedTime}
      </p>

      <div
        role="progressbar"
        aria-label="Progreso de la sesión"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-linear", isBreak ? "bg-done" : "bg-focus")}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-2 sm:flex-row">
        <Button size="lg" onClick={toggle} className="h-12 flex-1 text-base">
          {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {isActive ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button size="lg" variant="outline" onClick={reset} className="h-12 text-base">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setZen(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Moon className="h-4 w-4" />
        Modo zen: pantalla completa, sin distracciones
      </button>

      <AnimatePresence>
        {zen && (
          <ZenMode
            time={formattedTime}
            isActive={isActive}
            isBreak={isBreak}
            progress={progress}
            task={selectedTask}
            onToggle={toggle}
            onExit={() => setZen(false)}
          />
        )}
      </AnimatePresence>

      <div className="mt-12 w-full max-w-sm space-y-6 text-left">
        <div className="space-y-2">
          <p id="task-label" className="text-sm font-medium">Tarea</p>
          <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
            <SelectTrigger aria-labelledby="task-label" className="h-11">
              <SelectValue placeholder="Elige en qué vas a trabajar (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map(task => (
                <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTask ? (
            <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
              <PomodoroPips
                done={selectedTask.completedPomodoros || 0}
                total={selectedTask.estimatedPomodoros || 1}
                running={isActive && !isBreak}
              />
              <span className="digits">
                {selectedTask.completedPomodoros || 0} de {selectedTask.estimatedPomodoros}
              </span>
            </div>
          ) : (
            <p className="pt-1 text-sm text-muted-foreground">
              Si eliges una tarea, cada sesión terminada se suma a sus Pomodoros.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p id="preset-label" className="text-sm font-medium">Duración</p>
          <div role="radiogroup" aria-labelledby="preset-label" className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
            {presets.map((minutes) => (
              <button
                key={minutes}
                type="button"
                role="radio"
                aria-checked={duration === minutes}
                onClick={() => setDuration(minutes)}
                className={cn(
                  "rounded-md px-2 py-2.5 transition-colors",
                  duration === minutes
                    ? "bg-card font-semibold text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="digits text-base">{minutes} min</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={testChime}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Volume2 className="h-4 w-4" />
          Probar el sonido del aviso
        </button>
      </div>
    </div>
  );
}
