import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { appBaseUrl, isMailConfigured, passwordResetEmail, sendMail } from '@/lib/mailer'

export const runtime = 'nodejs'

// Same answer whether or not the email has an account, so the form can't be used to discover users.
const GENERIC_RESPONSE = {
  message: 'Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer la contraseña.',
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  // Matched exactly, like sign-in (accounts are stored as typed at sign-up)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Escribe un correo electrónico válido.' }, { status: 400 })
  }

  const isDev = process.env.NODE_ENV !== 'production'
  const baseUrl = appBaseUrl(request.nextUrl.origin)
  if ((!isMailConfigured() && !isDev) || !baseUrl) {
    console.error('Password reset requested but email (SMTP_*) or APP_URL is not configured.')
    return NextResponse.json(
      { error: 'La recuperación por correo no está disponible ahora mismo. Inténtalo más tarde.' },
      { status: 503 }
    )
  }

  try {
    const result = await AuthService.createPasswordResetToken(email)
    if (result) {
      const link = `${baseUrl}/reset-password?token=${result.token}`
      if (isMailConfigured()) {
        await sendMail({ to: result.user.email, ...passwordResetEmail(result.user.fullName, link) })
      } else {
        // Local development without SMTP: print the link instead of emailing it.
        console.log(`\n[password reset] ${result.user.email}\n${link}\n`)
      }
    }
    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error: any) {
    console.error('Password reset email failed:', error?.message ?? error)
    return NextResponse.json(
      { error: 'No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.' },
      { status: 500 }
    )
  }
}
