"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, RotateCcw, SendHorizontal } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PomodoroPips } from "@/components/PomodoroPips";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ProposedTask } from "@/ai/flows/assistant-chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposedTasks?: ProposedTask[];
  /** Indexes of proposed tasks already added to the board. */
  added?: number[];
}

/** Turns sent to the model per request; the route caps it at 20. */
const HISTORY_LIMIT = 12;

const priorityLabel = { high: "Alta", medium: "Media", low: "Baja" } as const;

const starters = [
  { label: "Tengo un objetivo", draft: "Mi objetivo es " },
  { label: "¿Qué tareas me llevaron más tiempo?", send: "¿Qué tareas me llevaron más tiempo?" },
  { label: "¿En qué me conviene seguir?", send: "¿En qué me conviene seguir ahora?" },
];

const newId = () => Math.random().toString(36).slice(2);

export function AssistantChat() {
  const { user, session, addTask } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const storageKey = user ? `taskzen-assistant-${user.id}` : null;

  // Keep the conversation across visits on this device (convenience only).
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages, storageKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending, error]);

  const send = async (text: string, history: Message[] = messages) => {
    const content = text.trim();
    if (!content || pending || !session) return;

    const userMessage: Message = { id: newId(), role: "user", content };
    const next = [...history, userMessage];
    setMessages(next);
    setInput("");
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          messages: next.slice(-HISTORY_LIMIT).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "El asistente no pudo responder.");

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: data.reply,
          proposedTasks: data.proposedTasks?.length ? data.proposedTasks : undefined,
        },
      ]);
    } catch (e: any) {
      setError(e.message || "El asistente no pudo responder.");
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  };

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    send(lastUser.content, messages.slice(0, messages.lastIndexOf(lastUser)));
  };

  const addProposed = async (messageId: string, indexes: number[]) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message?.proposedTasks || !user) return;
    const toAdd = indexes.filter((i) => !message.added?.includes(i));
    for (const i of toAdd) {
      const t = message.proposedTasks[i];
      await addTask(
        { title: t.title, description: t.description, priority: t.priority, estimatedPomodoros: t.estimatedPomodoros } as any,
        user.id
      );
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, added: [...(m.added ?? []), ...toAdd] } : m))
    );
    toast({
      title: toAdd.length === 1 ? "Tarea añadida a Por hacer" : `${toAdd.length} tareas añadidas a Por hacer`,
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const pickStarter = (s: (typeof starters)[number]) => {
    if (s.send) return send(s.send);
    setInput(s.draft ?? "");
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  };

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100dvh-6.5rem)] max-w-3xl flex-col">
      <div className="flex-1 overflow-y-auto pb-4" aria-live="polite">
        {empty ? (
          <div className="flex h-full flex-col justify-center py-10">
            <PomodoroPips done={2} total={3} size="lg" running />
            <h2 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">¿En qué trabajamos?</h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Cuéntame un objetivo y lo convierto en tareas para tu tablero. También puedo decirte dónde se
              fue tu tiempo y en qué te conviene seguir, a partir de tus Pomodoros.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {starters.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => pickStarter(s)}
                  className="rounded-full border bg-card px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}
                >
                  {m.role === "user" ? (
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
                      {m.content}
                    </p>
                  ) : (
                    <div className="w-full max-w-[92%]">
                      <AssistantText text={m.content} />
                      {m.proposedTasks && (
                        <ProposedTasks
                          tasks={m.proposedTasks}
                          added={m.added ?? []}
                          onAdd={(indexes) => addProposed(m.id, indexes)}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {pending && <Thinking />}

            {error && (
              <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={retry} className="ml-auto h-8">
                  Reintentar
                </Button>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t pt-3">
        <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 focus-within:ring-2 focus-within:ring-ring">
          <label htmlFor="assistant-input" className="sr-only">
            Escribe al asistente
          </label>
          <textarea
            id="assistant-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={2000}
            placeholder="Escribe tu objetivo o una pregunta"
            className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 outline-none [field-sizing:content] placeholder:text-muted-foreground focus-visible:outline-none"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || pending} aria-label="Enviar" className="h-10 w-10 shrink-0 rounded-xl">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
          <span>Enter para enviar, Mayús + Enter para una línea nueva</span>
          {!empty && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
              className="inline-flex items-center gap-1 rounded px-1.5 py-1 hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Nueva conversación
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/** Plain text with "- " lines rendered as a list. */
function AssistantText({ text }: { text: string }) {
  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const isItem = /^[-•*]\s+/.test(line);
    const type = isItem ? "ul" : "p";
    const clean = line.replace(/^[-•*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1");
    const last = blocks.at(-1);
    if (type === "ul" && last?.type === "ul") last.lines.push(clean);
    else blocks.push({ type, lines: [clean] });
  }

  return (
    <div className="space-y-3 leading-relaxed">
      {blocks.map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="space-y-1.5 pl-1">
            {b.lines.map((l, j) => (
              <li key={j} className="flex gap-2.5">
                <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-focus" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.lines[0]}</p>
        )
      )}
    </div>
  );
}

function ProposedTasks({
  tasks,
  added,
  onAdd,
}: {
  tasks: ProposedTask[];
  added: number[];
  onAdd: (indexes: number[]) => void;
}) {
  const remaining = tasks.map((_, i) => i).filter((i) => !added.includes(i));
  const totalPomodoros = tasks.reduce((sum, t) => sum + t.estimatedPomodoros, 0);

  return (
    <div className="mt-4 rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {tasks.length} tareas, <span className="digits">{totalPomodoros}</span> Pomodoros en total
        </p>
        {remaining.length > 1 && (
          <Button size="sm" onClick={() => onAdd(remaining)} className="h-8">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Añadir {remaining.length === tasks.length ? "todas" : `las ${remaining.length}`} al tablero
          </Button>
        )}
      </div>
      <ol className="divide-y">
        {tasks.map((t, i) => {
          const isAdded = added.includes(i);
          return (
            <li key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <PomodoroPips done={0} total={t.estimatedPomodoros} size="sm" />
                  <span className={t.priority === "high" ? "font-semibold text-destructive" : "text-muted-foreground"}>
                    {priorityLabel[t.priority]}
                  </span>
                </div>
              </div>
              {isAdded ? (
                <span className="inline-flex h-8 items-center gap-1 px-2 text-sm text-done">
                  <Check className="h-4 w-4" />
                  Añadida
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onAdd([i])} className="h-8">
                  Añadir
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Three pips filling in a loop while the model answers. */
function Thinking() {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
      <span className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-focus"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </span>
      Pensando…
    </div>
  );
}
