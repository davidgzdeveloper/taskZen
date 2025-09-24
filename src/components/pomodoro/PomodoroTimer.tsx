"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/hooks/useAppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Task } from "@/lib/types";
import { Play, Pause, RotateCcw } from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const CircleProgress = ({ progress, isMobile = false }: { progress: number, isMobile?: boolean }) => {
  const strokeWidth = isMobile ? 6 : 8;
  const radius = isMobile ? 70 : 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const size = isMobile ? 180 : 200;

  return (
    <div className={`relative ${isMobile ? 'w-44 h-44' : 'w-56 h-56'}`}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-muted"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size/2}
          cy={size/2}
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
          cx={size/2}
          cy={size/2}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      
    </div>
  );
};

export function PomodoroTimer() {
  const { board, user, updateTask: updateAppContextTask } = useAppContext();
  const { session } = useAuth();
  const { toast } = useToast();
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [duration, setDuration] = useState(user?.preferences?.pomodoroWork || 25);
  const [time, setTime] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

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
        title: "Pomodoro Completed!",
        description: `One pomodoro for "${task.title}" has been registered.`,
      });

    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: "Failed to save pomodoro session.",
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
        title: `Time for a ${newSessionType}!`,
        description: `Your ${sessionType} session has ended.`,
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

  const progress = ((duration * 60 - time) / (duration * 60)) * 100;

  // Detect mobile using screen size
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex items-center justify-center p-4">
        <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
            <CardHeader className={isMobile ? 'pb-4' : ''}>
                <CardTitle className={`text-center ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    {sessionType === 'work' ? 'Focus Session' : 'Time for a Break'}
                </CardTitle>
            </CardHeader>
            <CardContent className={`flex flex-col items-center ${isMobile ? 'gap-4' : 'gap-6'}`}>
                <div className="relative">
                    <CircleProgress progress={progress} isMobile={isMobile} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold font-mono text-foreground`}>
                          {formatTime(time)}
                        </span>
                    </div>
                </div>
                
                {/* Preset Buttons - responsive layout */}
                <div className={`${isMobile ? 'flex flex-col gap-2 w-full' : 'flex gap-2'}`}>
                    <Button 
                      variant={duration === 15 ? 'default' : 'secondary'} 
                      onClick={() => setPreset(15, 3)}
                      className={isMobile ? 'text-sm' : ''}
                      size={isMobile ? 'sm' : 'default'}
                    >
                      Short (15/3)
                    </Button>
                    <Button 
                      variant={duration === 25 ? 'default' : 'secondary'} 
                      onClick={() => setPreset(25, 5)}
                      className={isMobile ? 'text-sm' : ''}
                      size={isMobile ? 'sm' : 'default'}
                    >
                      Standard (25/5)
                    </Button>
                    <Button 
                      variant={duration === 45 ? 'default' : 'secondary'} 
                      onClick={() => setPreset(45, 10)}
                      className={isMobile ? 'text-sm' : ''}
                      size={isMobile ? 'sm' : 'default'}
                    >
                      Long (45/10)
                    </Button>
                </div>

                {/* Task Selection */}
                <div className="w-full">
                    <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                        <SelectTrigger className={isMobile ? 'text-sm' : ''}>
                            <SelectValue placeholder={isMobile ? "Select task (optional)" : "Select a task to focus on (optional)"} />
                        </SelectTrigger>
                        <SelectContent>
                            {tasks.map(task => (
                                <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Control Buttons */}
                <div className={`${isMobile ? 'flex flex-col gap-2 w-full' : 'flex gap-4'}`}>
                    <Button 
                      size={isMobile ? 'default' : 'lg'} 
                      onClick={() => setIsActive(!isActive)} 
                      className={isMobile ? 'w-full' : 'w-32'}
                    >
                        {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                        {isActive ? 'Pause' : 'Start'}
                    </Button>
                    <Button 
                      size={isMobile ? 'default' : 'lg'} 
                      variant="outline" 
                      onClick={resetTimer}
                      className={isMobile ? 'w-full' : ''}
                    >
                        <RotateCcw className="mr-2" />
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}