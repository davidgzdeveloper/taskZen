"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";
import {
  notifySessionEnd,
  playChimeNow,
  requestNotificationPermission,
  scheduleChime,
  unlockAudio,
  type ScheduledChime,
} from "@/lib/alarm";

type SessionType = "work" | "break";

interface TimerContextValue {
  sessionType: SessionType;
  isBreak: boolean;
  isActive: boolean;
  /** Seconds left in the current session. */
  time: number;
  formattedTime: string;
  /** 0–100 through the current session. */
  progress: number;
  /** A session is running, paused part-way, or on break. */
  inSession: boolean;
  duration: number;
  setDuration: (minutes: number) => void;
  selectedTaskId?: string;
  setSelectedTaskId: (id: string | undefined) => void;
  selectedTask?: Task;
  toggle: () => void;
  reset: () => void;
  testChime: () => void;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * The Pomodoro timer lives here, above the pages, so a session keeps running
 * (and rings) while the user moves around the app.
 */
export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { board, user, session, updateTask } = useAuth();
  const { toast } = useToast();

  const breakMinutes = user?.preferences?.pomodoroBreak || 5;
  const wantsNotifications = user?.preferences?.notifications ?? true;

  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [duration, setDuration] = useState(user?.preferences?.pomodoroWork || 25);
  const [time, setTime] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

  /** When the running session ends (ms since epoch); null while paused. */
  const endAtRef = useRef<number | null>(null);
  const chimeRef = useRef<ScheduledChime | null>(null);

  const sessionLength = (sessionType === "work" ? duration : breakMinutes) * 60;

  const reset = useCallback(() => {
    setIsActive(false);
    setTime((sessionType === "work" ? duration : breakMinutes) * 60);
  }, [sessionType, duration, breakMinutes]);

  // Start/pause from a user gesture: that's when browsers allow audio and notification prompts.
  const toggle = useCallback(() => {
    if (!isActive) {
      unlockAudio();
      if (wantsNotifications) requestNotificationPermission();
    }
    setIsActive((a) => !a);
  }, [isActive, wantsNotifications]);

  const testChime = useCallback(() => {
    unlockAudio();
    playChimeNow("work");
  }, []);

  const addPomodoroToTask = async (taskId: string) => {
    const task = board.tasks[taskId];
    if (!task || !session) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ completedPomodoros: (task.completedPomodoros || 0) + 1 }),
      });
      if (!response.ok) throw new Error("Failed to update task on the server");
      updateTask(taskId, await response.json());
      toast({ title: "Pomodoro completado", description: `Sumado a "${task.title}".` });
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "No se pudo guardar el Pomodoro",
        description: "La sesión terminó, pero no se sumó a la tarea. Comprueba tu conexión.",
        variant: "destructive",
      });
    }
  };

  // Remaining time is derived from a fixed end timestamp, so it stays exact
  // even when a hidden tab throttles the interval.
  useEffect(() => {
    if (!isActive) {
      endAtRef.current = null;
      return;
    }
    if (endAtRef.current === null) endAtRef.current = Date.now() + time * 1000;
    const tick = () => {
      if (endAtRef.current === null) return;
      setTime(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)));
    };
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
    // `time` is only read to seed a new session; re-running on every tick would reset the end time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, sessionType]);

  // The chime is booked on the audio clock for the exact end of the session, so it
  // rings on time even in a throttled background tab. Pausing or resetting cancels it.
  useEffect(() => {
    chimeRef.current?.cancel();
    chimeRef.current =
      isActive && endAtRef.current !== null
        ? scheduleChime((endAtRef.current - Date.now()) / 1000, sessionType)
        : null;
  }, [isActive, sessionType]);

  // Signing out unmounts the app shell: drop any pending chime with it.
  useEffect(() => () => chimeRef.current?.cancel(), []);

  useEffect(() => {
    if (!isActive || time !== 0) return;

    // Session finished. The audio clock can drift from the wall clock over a long
    // session; if the booked chime hasn't played yet, play it now instead.
    const booked = chimeRef.current;
    chimeRef.current = null;
    if (!booked?.hasStarted()) {
      booked?.cancel();
      playChimeNow(sessionType);
    }
    endAtRef.current = null;

    const finishedWork = sessionType === "work";
    if (finishedWork && selectedTaskId) addPomodoroToTask(selectedTaskId);

    if (wantsNotifications) {
      const taskTitle = selectedTaskId ? board.tasks[selectedTaskId]?.title : undefined;
      notifySessionEnd(
        finishedWork ? "Sesión de foco terminada" : "Descanso terminado",
        finishedWork
          ? `${taskTitle ? `+1 Pomodoro en "${taskTitle}". ` : ""}Toca descansar ${breakMinutes} minutos.`
          : "Vuelve cuando quieras y pulsa Iniciar."
      );
    }

    if (finishedWork) {
      // The break starts on its own
      setSessionType("break");
      setTime(breakMinutes * 60);
    } else {
      setSessionType("work");
      setTime(duration * 60);
      setIsActive(false);
    }

    toast({
      title: finishedWork ? "Hora de descansar" : "Descanso terminado",
      description: finishedWork ? "El descanso ya está en marcha." : "Pulsa Iniciar cuando quieras volver al foco.",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, time]);

  // Changing the duration (preset or settings) starts over. Not on session changes:
  // that would stop the break the moment it auto-starts.
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  // Closing or reloading the tab is the one thing that still loses a running session.
  useEffect(() => {
    if (!isActive) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isActive]);

  const value = useMemo<TimerContextValue>(
    () => ({
      sessionType,
      isBreak: sessionType === "break",
      isActive,
      time,
      formattedTime: formatTime(time),
      progress: ((sessionLength - time) / sessionLength) * 100,
      inSession: isActive || sessionType === "break" || time !== sessionLength,
      duration,
      setDuration,
      selectedTaskId,
      setSelectedTaskId,
      selectedTask: selectedTaskId ? board.tasks[selectedTaskId] : undefined,
      toggle,
      reset,
      testChime,
    }),
    [sessionType, isActive, time, sessionLength, duration, selectedTaskId, board.tasks, toggle, reset, testChime]
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within a TimerProvider");
  return context;
}
