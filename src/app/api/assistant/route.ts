import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskService } from '@/lib/services/taskService'
import { computeInsights } from '@/lib/insights'
import { ChatMessageSchema, runAssistantChat } from '@/ai/flows/assistant-chat'

// Force Node.js runtime for bcryptjs compatibility
export const runtime = 'nodejs'
// Gemini can take a while on long plans
export const maxDuration = 60

const BodySchema = z.object({
  // Only the recent turns are sent; older context adds cost without helping much.
  messages: z.array(ChatMessageSchema).min(1).max(20),
})

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 })
  }

  const user = await AuthService.getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: 'El asistente no está configurado: falta GEMINI_API_KEY en el servidor.' },
      { status: 503 }
    )
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== 'user') {
    return NextResponse.json({ error: 'Mensaje no válido.' }, { status: 400 })
  }

  try {
    // Data is read server-side so the assistant only ever sees this user's real tasks.
    const [tasks, preferences] = await Promise.all([
      TaskService.getUserTasks(user.id),
      prisma.userPreferences.findUnique({ where: { userId: user.id } }),
    ])

    const insights = computeInsights(tasks, preferences?.pomodoroWork ?? 25)
    const openTaskTitles = tasks
      .filter((t) => t.status !== 'done')
      .slice(0, 40)
      .map((t) => t.title)

    const reply = await runAssistantChat({
      messages: parsed.data.messages,
      insights,
      openTaskTitles,
      userName: user.fullName,
    })

    return NextResponse.json(reply)
  } catch (error: any) {
    const message = String(error?.message ?? error)
    console.error('Assistant error:', message)

    if (/429|RESOURCE_EXHAUSTED|quota/i.test(message)) {
      return NextResponse.json(
        { error: 'Se alcanzó el límite gratuito de Gemini por ahora. Espera un minuto y vuelve a intentarlo.' },
        { status: 429 }
      )
    }
    if (/API key|API_KEY_INVALID|PERMISSION_DENIED/i.test(message)) {
      return NextResponse.json(
        { error: 'La clave de Gemini del servidor no es válida. Revisa GEMINI_API_KEY.' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'El asistente no pudo responder. Inténtalo de nuevo en unos segundos.' },
      { status: 500 }
    )
  }
}
