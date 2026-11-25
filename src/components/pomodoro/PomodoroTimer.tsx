"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/hooks/useAppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Task } from "@/lib/types";
import { Play, Pause, RotateCcw, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ZenMode } from "./ZenMode";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { PomodoroPips } from "@/components/PomodoroPips";
import { cn } from "@/lib/utils";

const presets = [
  { work: 15, break: 3 },
  { work: 25, break: 5 },
  { work: 45, break: 10 },
];

export function PomodoroTimer() {
  const { board, user, updateTask: updateAppContextTask } = useAppContext();
  const { session } = useAuth();
  const { toast } = useToast();
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [duration, setDuration] = useState(user?.preferences?.pomodoroWork || 25);
  const [time, setTime] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [zen, setZen] = useState(false);

  // /timer?zen=1 opens straight into zen mode (linked from the dashboard).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('zen') === '1') setZen(true);
  }, []);
  const alarmAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    alarmAudio.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
  }, []);

  const tasks = useMemo(() => Object.values(board.tasks).filter(t => t.status !== 'done'), [board.tasks]) as Task[];

  const handlePomodoroCompletion = async () => {
    if (!selectedTaskId || !session) return;

    const task = board.tasks[selectedTaskId];
    if (!task) return;

    const newCompletedPomodoros = (task.completedPomodoros || 0) + 1;

    try {
      // Update backend
      const response = await fetch(`/api/tasks/${selectedTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({ completedPomodoros: newCompletedPomodoros }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task on the server');
      }

      const updatedTask = await response.json();

      // Update local context immediately
      if (updateAppContextTask) {
        updateAppContextTask(selectedTaskId, updatedTask);
      }

      toast({
        title: "Pomodoro completado",
        description: `Sumado a "${task.title}".`,
      });

    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "No se pudo guardar el Pomodoro",
        description: "La sesión terminó, pero no se sumó a la tarea. Comprueba tu conexión.",
        variant: "destructive",
      });
      // Optionally, revert the optimistic update in context
      if (updateAppContextTask) {
        updateAppContextTask(selectedTaskId, { completedPomodoros: task.completedPomodoros });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    const newTime = (sessionType === 'work' ? duration : user?.preferences?.pomodoroBreak || 5) * 60;
    setTime(newTime);
  }, [sessionType, duration, user?.preferences?.pomodoroBreak]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      // Session finished
      alarmAudio.current?.play();

      if (sessionType === 'work') {
        handlePomodoroCompletion();
      }

      const newSessionType = sessionType === 'work' ? 'break' : 'work';
      setSessionType(newSessionType);
      
      if (newSessionType === 'break') {
        // Automatically start the break
        const newDuration = user?.preferences?.pomodoroBreak || 5;
        setTime(newDuration * 60);
        setIsActive(true); // Keep it active for the break
      } else {
        // Work session after a break, stop the timer
        const newDuration = duration;
        setTime(newDuration * 60);
        setIsActive(false); // Stop the timer
      }

      toast({
        title: newSessionType === 'break' ? 'Hora de descansar' : 'Descanso terminado',
        description: newSessionType === 'break' ? 'El descanso ya está en marcha.' : 'Pulsa Iniciar cuando quieras volver al foco.',
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, sessionType, duration, user?.preferences?.pomodoroBreak, toast, selectedTaskId]);
  
  useEffect(() => {
    resetTimer();
  }, [duration, resetTimer]);

  const setPreset = (work: number, brk: number) => {
    setDuration(work);
    // This will trigger the useEffect to reset the timer
  };

  const sessionLength = (sessionType === 'work' ? duration : user?.preferences?.pomodoroBreak || 5) * 60;
  const progress = ((sessionLength - time) / sessionLength) * 100;
  const selectedTask = selectedTaskId ? board.tasks[selectedTaskId] : undefined;
  const isBreak = sessionType === 'break';

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-6 text-center sm:py-10">
      <motion.p
        key={sessionType}
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
        {formatTime(time)}
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
        <Button size="lg" onClick={() => setIsActive(!isActive)} className="h-12 flex-1 text-base">
          {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {isActive ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button size="lg" variant="outline" onClick={resetTimer} className="h-12 text-base">
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
            time={formatTime(time)}
            isActive={isActive}
            isBreak={isBreak}
            progress={progress}
            task={selectedTask}
            onToggle={() => setIsActive(a => !a)}
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
            {presets.map((preset) => (
              <button
                key={preset.work}
                type="button"
                role="radio"
                aria-checked={duration === preset.work}
                onClick={() => setPreset(preset.work, preset.break)}
                className={cn(
                  "rounded-md px-2 py-2.5 transition-colors",
                  duration === preset.work
                    ? "bg-card font-semibold text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="digits text-base">{preset.work} min</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
