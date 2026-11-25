"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/hooks/useAppContext";
import { useAuth } from "@/contexts/AuthContext";
import { TaskPriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState, FormEvent } from "react";

const MAX_POMODOROS = 8;

/** Pick an estimate by clicking the pip it should end on. */
function PomodoroEstimate({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-labelledby="pomodoros-label" className="flex items-center gap-1">
      {Array.from({ length: MAX_POMODOROS }, (_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? "pomodoro" : "pomodoros"}`}
            onClick={() => onChange(n)}
            className="grid h-8 w-8 place-items-center rounded-full"
          >
            <span
              className={cn(
                "h-4 w-4 rounded-full transition-colors",
                n <= value ? "bg-focus" : "border-[1.5px] border-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
      <span className="digits ml-2 text-sm text-muted-foreground">
        {value * 25} min
      </span>
    </div>
  );
}

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const { addTask } = useAppContext();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !user) return;

    try {
      await addTask({
        title,
        description,
        priority,
        estimatedPomodoros,
      }, user.id);

      setOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setEstimatedPomodoros(1);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle id="dialog-title" className="text-2xl font-bold">Nueva tarea</DialogTitle>
          <DialogDescription id="dialog-description">
            Se añadirá a Por hacer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escribir propuesta para el cliente"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label id="pomodoros-label">¿Cuántos Pomodoros te llevará?</Label>
              <PomodoroEstimate value={estimatedPomodoros} onChange={setEstimatedPomodoros} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Crear tarea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
