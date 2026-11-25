"use client";

import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { PriorityPieChart } from "@/components/dashboard/PriorityPieChart";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { PomodoroPips } from "@/components/PomodoroPips";
import { CountUp } from "@/components/CountUp";
import Link from "next/link";
import { useAppContext } from "@/hooks/useAppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Task } from "@/lib/types";
import { Calendar as CalendarIcon, Moon } from "lucide-react";
import { useMemo, useState } from "react";
import { format, isToday, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function DashboardPage() {
  const { board } = useAppContext();
  const { user } = useAuth();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  const tasks = useMemo(() => Object.values(board.tasks), [board.tasks]);

  // Counts come from the board already in memory (loaded once by AuthContext),
  // so the dashboard needs no extra requests and stays in sync with every move.
  const columnCounts = useMemo(() => {
    const done = board.columns.done.taskIds.length;
    return [
      { label: "Por hacer", value: board.columns.todo.taskIds.length },
      { label: "En curso", value: board.columns["in-progress"].taskIds.length },
      { label: "Hechas", value: done },
      { label: "Puntos", value: done * 10 },
    ];
  }, [board.columns]);
  
  const todayStats = useMemo(() => {
    const completedToday = tasks.filter(task => 
      task.completedAt && isToday(new Date(task.completedAt))
    );
    return {
      tasksCompleted: completedToday.length,
      pomodorosCompleted: completedToday.reduce((acc, task) => acc + (task.completedPomodoros || 0), 0),
    };
  }, [tasks]);

  const activityData = useMemo(() => {
    const activityMap: { [key: string]: { date: string; tasksCompleted: number; pomodorosCompleted: number } } = {};
    tasks.forEach(task => {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (date?.from && date?.to && completedDate >= date.from && completedDate <= date.to) {
          const dateStr = format(completedDate, 'yyyy-MM-dd');
          if (!activityMap[dateStr]) {
            activityMap[dateStr] = { date: dateStr, tasksCompleted: 0, pomodorosCompleted: 0 };
          }
          activityMap[dateStr].tasksCompleted += 1;
          activityMap[dateStr].pomodorosCompleted += task.completedPomodoros || 0;
        }
      }
    });
    return Object.values(activityMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tasks, date]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="today-title" className="grid gap-8 rounded-xl border bg-card p-5 sm:p-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <h2 id="today-title" className="text-xl font-semibold">Hoy</h2>
          <p className="numeral mt-3 text-7xl font-bold leading-none sm:text-8xl">
            <CountUp value={todayStats.pomodorosCompleted} />
          </p>
          <p className="mt-2 text-muted-foreground">
            {todayStats.pomodorosCompleted === 1 ? "Pomodoro" : "Pomodoros"} en {todayStats.tasksCompleted}{" "}
            {todayStats.tasksCompleted === 1 ? "tarea terminada" : "tareas terminadas"}
          </p>
          {todayStats.pomodorosCompleted > 0 && (
            <PomodoroPips
              done={todayStats.pomodorosCompleted}
              total={todayStats.pomodorosCompleted}
              size="lg"
              className="mt-5"
            />
          )}
          <Link
            href="/timer?zen=1"
            className="mt-6 flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Moon className="h-4 w-4" />
            Empezar una sesión en modo zen
          </Link>
        </div>
        <dl className="grid grid-cols-2 content-end gap-x-6 gap-y-5">
          {columnCounts.map((item) => (
            <div key={item.label} className="border-t pt-3">
              <dt className="text-sm text-muted-foreground">{item.label}</dt>
              <dd className="numeral mt-1 text-3xl font-semibold"><CountUp value={item.value} /></dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal sm:w-[300px]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "d MMM y", { locale: es })} – {format(date.to, "d MMM y", { locale: es })}
                  </>
                ) : (
                  format(date.from, "d MMM y", { locale: es })
                )
              ) : (
                <span>Elige un rango de fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              locale={es}
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <ActivityChart data={activityData} />
      <div className="grid gap-6 lg:grid-cols-2">
        <PriorityPieChart tasks={tasks as Task[]} />
        <RecentTasks tasks={tasks as Task[]} />
      </div>
    </div>
  );
}
