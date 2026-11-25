import {ai, withModelFallback} from '@/ai/genkit';
import {z} from 'genkit';
import type {WorkInsights} from '@/lib/insights';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ProposedTaskSchema = z.object({
  title: z.string().describe('Acción concreta, empieza por un verbo. Máximo 80 caracteres.'),
  description: z.string().describe('Una frase con qué significa terminarla.'),
  priority: z.enum(['high', 'medium', 'low']),
  estimatedPomodoros: z.number().int().min(1).max(8).describe('Sesiones de foco necesarias.'),
});
export type ProposedTask = z.infer<typeof ProposedTaskSchema>;

const AssistantReplySchema = z.object({
  reply: z
    .string()
    .describe('Respuesta en español para el usuario. Texto plano; listas con "- " al inicio de línea.'),
  proposedTasks: z
    .array(ProposedTaskSchema)
    .max(10)
    .describe('Solo cuando el usuario comparte un objetivo o pide un plan. Si no, lista vacía.'),
});
export type AssistantReply = z.infer<typeof AssistantReplySchema>;

function systemPrompt(insights: WorkInsights, openTaskTitles: string[], userName: string | null) {
  return `Eres el asistente de TaskZen, una app que mide el trabajo en Pomodoros (sesiones de foco de ${insights.pomodoroMinutes} minutos).
Hablas en español, de tú, con frases claras y cortas. Nada de relleno ni entusiasmo exagerado.
${userName ? `El usuario se llama ${userName}.` : ''}
Fecha de hoy: ${new Date().toISOString().slice(0, 10)}.

Haces tres cosas:
1. Planes de acción. Cuando el usuario cuente un objetivo, conviértelo en 3 a 8 tareas concretas en "proposedTasks": cada una debe poder empezarse hoy, cabe en 1 a 8 Pomodoros y empieza por un verbo. Si el objetivo es demasiado vago para planificarlo, haz una sola pregunta para concretarlo y deja "proposedTasks" vacía. No repitas tareas que ya tiene abiertas. En "reply" explica el orden en una o dos frases; no repitas la lista entera.
2. Dónde se fue el tiempo. Usa "mostTime" y "overruns" de los datos. Da minutos u horas, Pomodoros reales frente a estimados y una lectura útil (por ejemplo, si suele quedarse corto al estimar).
3. En qué le conviene seguir. Recomienda 1 a 3 tareas existentes, por este orden de peso: las casi terminadas ("nearlyDone"), las de prioridad alta, las que llevan días paradas ("stalled"). Di por qué en una frase cada una.

Reglas:
- Las cifras salen SOLO de los datos de abajo. No inventes tareas, tiempos ni fechas. Si no hay datos suficientes (por ejemplo, ningún Pomodoro registrado), dilo y sugiere cómo empezar a registrarlos con el temporizador.
- Fuera de estos temas (productividad, sus tareas, sus objetivos), responde en una frase que solo puedes ayudar con eso.
- "proposedTasks" va vacía salvo en el caso 1.

Datos del usuario (calculados por la app, fiables):
${JSON.stringify(insights)}

Títulos de sus tareas abiertas:
${openTaskTitles.length ? openTaskTitles.map((t) => `- ${t}`).join('\n') : '(ninguna)'}`;
}

export async function runAssistantChat(input: {
  messages: ChatMessage[];
  insights: WorkInsights;
  openTaskTitles: string[];
  userName: string | null;
}): Promise<AssistantReply> {
  const {messages, insights, openTaskTitles, userName} = input;

  const {output} = await withModelFallback((model) =>
    ai.generate({
      model,
      system: systemPrompt(insights, openTaskTitles, userName),
      messages: messages.map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        content: [{text: m.content}],
      })),
      output: {schema: AssistantReplySchema},
      config: {temperature: 0.4},
    })
  );

  if (!output) throw new Error('Empty response from model');
  return output;
}
