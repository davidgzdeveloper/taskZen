"use client";

import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { PriorityPieChart } from "@/components/dashboard/PriorityPieChart";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useAppContext } from "@/hooks/useAppContext";
import { mockDailyStats } from "@/lib/mock-data";
import { Task } from "@/lib/types";
import { CheckCircle2, Target, Trophy, Clock } from "lucide-react";
import { useMemo } from "react";

export default function DashboardPage() {
  const { user, board } = useAppContext();
  const tasks = useMemo(() => Object.values(board.tasks), [board.tasks]);
  
  if (!user) return null;

  const todayStats = {
    tasksCompleted: mockDailyStats.slice(-1)[0]?.tasksCompleted || 0,
    pomodorosCompleted: mockDailyStats.slice(-1)[0]?.pomodorosCompleted || 0,
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
          title="Current Streak"
          value={`${user.stats.currentStreak} days`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Score"
          value={user.stats.totalScore.toLocaleString()}
          icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityChart data={mockDailyStats} />
        <PriorityPieChart tasks={tasks as Task[]} />
      </div>
      <div>
        <RecentTasks tasks={tasks as Task[]} />
      </div>
    </div>
  );
}
