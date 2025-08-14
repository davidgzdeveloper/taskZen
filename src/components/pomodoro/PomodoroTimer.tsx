"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/hooks/useAppContext";
import { Task } from "@/lib/types";
import { Play, Pause, RotateCcw } from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const CircleProgress = ({ progress }: { progress: number }) => {
  const strokeWidth = 8;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-56 h-56">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <circle
          className="text-muted"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
        />
        <circle
          className="text-primary transition-all duration-300"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
          transform="rotate(-90 100 100)"
        />
      </svg>
      
    </div>
  );
};

export function PomodoroTimer() {
  const { board, user } = useAppContext();
  const { toast } = useToast();
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [duration, setDuration] = useState(user?.preferences.pomodoroWork || 25);
  const [time, setTime] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

  const tasks = useMemo(() => Object.values(board.tasks).filter(t => t.status !== 'done'), [board.tasks]) as Task[];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    const newTime = (sessionType === 'work' ? duration : user?.preferences.pomodoroBreak || 5) * 60;
    setTime(newTime);
  }, [sessionType, duration, user?.preferences.pomodoroBreak]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      // Session finished
      setIsActive(false);
      const newSessionType = sessionType === 'work' ? 'break' : 'work';
      setSessionType(newSessionType);
      const newDuration = newSessionType === 'work' ? duration : user?.preferences.pomodoroBreak || 5;
      setTime(newDuration * 60);
      toast({
        title: `Time for a ${newSessionType}!`,
        description: `Your ${sessionType} session has ended.`,
      });
      // In a real app, here you would save the session and update task pomodoros
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, sessionType, duration, user?.preferences.pomodoroBreak, toast]);
  
  useEffect(() => {
    resetTimer();
  }, [duration, resetTimer]);

  const setPreset = (work: number, brk: number) => {
    setDuration(work);
    // This will trigger the useEffect to reset the timer
  };

  const progress = ((duration * 60 - time) / (duration * 60)) * 100;

  return (
    <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-center text-2xl">
                    {sessionType === 'work' ? 'Focus Session' : 'Time for a Break'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div className="relative">
                    <CircleProgress progress={progress} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-bold font-mono text-foreground">{formatTime(time)}</span>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Button variant={duration === 25 ? 'default' : 'secondary'} onClick={() => setPreset(25, 5)}>Standard (25/5)</Button>
                    <Button variant={duration === 15 ? 'default' : 'secondary'} onClick={() => setPreset(15, 3)}>Short (15/3)</Button>
                    <Button variant={duration === 45 ? 'default' : 'secondary'} onClick={() => setPreset(45, 10)}>Long (45/10)</Button>
                </div>

                <div className="w-full">
                    <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a task to focus on (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {tasks.map(task => (
                                <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-4">
                    <Button size="lg" onClick={() => setIsActive(!isActive)} className="w-32">
                        {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                        {isActive ? 'Pause' : 'Start'}
                    </Button>
                    <Button size="lg" variant="outline" onClick={resetTimer}>
                        <RotateCcw className="mr-2" />
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
