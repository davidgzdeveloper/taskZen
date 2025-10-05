"use client";

import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { PriorityPieChart } from "@/components/dashboard/PriorityPieChart";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useAppContext } from "@/hooks/useAppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Task, DashboardStats } from "@/lib/types";
import { CheckCircle2, Target, Trophy, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { format, isToday, parseISO, subDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function DashboardPage() {
  const { board } = useAppContext();
  const { user, session } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  const tasks = useMemo(() => Object.values(board.tasks), [board.tasks]);
  
  // Load dashboard stats from API
  useEffect(() => {
    let isMounted = true;
    
    const loadDashboardStats = async () => {
      if (!session) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${session.token}` }
        });
        
        if (response.ok && isMounted) {
          const stats = await response.json();
          setDashboardStats(stats);
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (session) {
      loadDashboardStats();
    }
    
    return () => {
      isMounted = false;
    };
  }, [session]);

  // Reload stats when tasks change significantly (but debounced)
  useEffect(() => {
    if (!session || loading) return;
    
    const timeoutId = setTimeout(() => {
      fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${session.token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(stats => stats && setDashboardStats(stats))
      .catch(err => console.error('Failed to update dashboard stats:', err));
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timeoutId);
  }, [tasks.length, session, loading]);
  
  if (!user) return null;

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

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tasks Completed Today"
          value={todayStats.tasksCompleted}
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Pomodoros Today"
          value={todayStats.pomodorosCompleted}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Tasks"
          value={dashboardStats?.totalTasks || 0}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Score"
          value={(dashboardStats?.totalScore || 0).toLocaleString()}
          icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">To Do</h3>
          <div className="text-2xl font-bold">{dashboardStats?.pendingTasks || 0}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">In Progress</h3>
          <div className="text-2xl font-bold">{dashboardStats?.inProgressTasks || 0}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Completed</h3>
          <div className="text-2xl font-bold">{dashboardStats?.completedTasks || 0}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1 mt-6">
        <ActivityChart data={activityData} dateRange={date} />
        <PriorityPieChart tasks={tasks as Task[]} />
      </div>
      <div>
        <RecentTasks tasks={tasks as Task[]} />
      </div>
    </div>
  );
}
