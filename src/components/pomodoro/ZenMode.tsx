"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, X } from "lucide-react";
import { PomodoroPips } from "@/components/PomodoroPips";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ZenModeProps {
  time: string;
  isActive: boolean;
  isBreak: boolean;
  progress: number;
  task?: Task;
  onToggle: () => void;
  onExit: () => void;
}

/** Half of the 8s `breathe` cycle: inhale while the circle grows, exhale while it shrinks. */
const BREATH_MS = 4000;

/**
 * Full-screen focus view: only the clock, the task and a breathing circle.
 * Always uses the night palette. Space starts/pauses, Esc leaves.
 */
export function ZenMode({ time, isActive, isBreak, progress, task, onToggle, onExit }: ZenModeProps) {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [inhale, setInhale] = useState(true);
  // The timer re-renders every second; keep the latest handlers without re-running the setup effect.
  const handlers = useRef({ onToggle, onExit });
  handlers.current = { onToggle, onExit };

  useEffect(() => {
    toggleRef.current?.focus();
    document.documentElement.requestFullscreen?.().catch(() => {});

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlers.current.onExit();
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handlers.current.onToggle();
      }
    };
    // Esc in native fullscreen only exits fullscreen; follow it out of zen mode too.
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) handlers.current.onExit();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setInhale((v) => !v), BREATH_MS);
    return () => clearInterval(id);
  }, []);

  const caption = isBreak
    ? inhale ? "Inhala" : "Exhala"
    : task?.title ?? "Una cosa a la vez.";

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Modo zen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="dark fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground"
    >
      <button
        type="button"
        onClick={onExit}
        className="absolute right-4 top-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
        Salir del modo zen
      </button>

      <div className="relative grid place-items-center">
        {/* The breathing circle: 4s in, 4s out. Calmer and fainter while focusing. */}
        <span
          aria-hidden
          className={cn(
            "absolute aspect-square w-[min(80vw,34rem)] rounded-full animate-breathe",
            isBreak ? "bg-done/15" : "bg-focus/[0.07]",
            !isActive && "[animation-play-state:paused]"
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute aspect-square w-[min(60vw,25rem)] rounded-full border animate-breathe",
            isBreak ? "border-done/40" : "border-focus/25",
            !isActive && "[animation-play-state:paused]"
          )}
          style={{ animationDelay: "-0.6s" }}
        />

        <div className="relative flex flex-col items-center text-center">
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={cn("max-w-xs text-lg", isBreak ? "text-done" : "text-muted-foreground")}
          >
            {caption}
          </motion.p>
          <p role="timer" className="numeral mt-2 text-[5.5rem] font-bold leading-none sm:text-[9rem]">
            {time}
          </p>
          {task && !isBreak && (
            <PomodoroPips
              done={task.completedPomodoros || 0}
              total={task.estimatedPomodoros || 1}
              running={isActive}
              className="mt-5"
            />
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
        <div
          className={cn("h-full transition-[width] duration-1000 ease-linear", isBreak ? "bg-done" : "bg-focus")}
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        ref={toggleRef}
        type="button"
        onClick={onToggle}
        className="absolute bottom-10 flex items-center gap-2 rounded-full border px-6 py-3 text-base font-medium transition-colors hover:bg-muted"
      >
        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {isActive ? "Pausar" : "Iniciar"}
        <kbd className="ml-1 hidden rounded border px-1.5 text-xs text-muted-foreground sm:inline">espacio</kbd>
      </button>
    </motion.div>,
    document.body
  );
}
