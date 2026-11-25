"use client";

import { useEffect, useState } from "react";
import { PomodoroPips } from "@/components/PomodoroPips";

/** A small, living picture of zen mode: the clock, the task, the breathing circle. */
export function ZenPreview() {
  const [seconds, setSeconds] = useState(18 * 60 + 42);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 25 * 60)), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      role="img"
      aria-label="Vista previa del modo zen: un reloj a pantalla completa con un círculo que respira"
      className="relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-2xl border bg-background"
    >
      <span aria-hidden className="absolute aspect-square w-[78%] rounded-full bg-focus/[0.08] animate-breathe" />
      <span
        aria-hidden
        className="absolute aspect-square w-[58%] rounded-full border border-focus/30 animate-breathe"
        style={{ animationDelay: "-0.6s" }}
      />
      <div className="relative flex flex-col items-center text-center">
        <p className="text-sm text-muted-foreground">Escribir propuesta para el cliente</p>
        <p className="numeral mt-1 text-6xl font-bold leading-none text-foreground sm:text-7xl">
          {mm}:{ss}
        </p>
        <PomodoroPips done={2} total={4} running className="mt-4" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
        <div className="h-full bg-focus" style={{ width: `${((25 * 60 - seconds) / (25 * 60)) * 100}%` }} />
      </div>
    </div>
  );
}
