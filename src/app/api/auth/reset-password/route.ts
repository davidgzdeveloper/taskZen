import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!token) {
    return NextResponse.json({ error: 'Falta el enlace de recuperación. Ábrelo desde el correo.' }, { status: 400 })
  }
  // Same minimum as sign-up
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 })
  }

  try {
    const result = await AuthService.resetPassword(token, password)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ message: 'Contraseña actualizada.' })
  } catch (error: any) {
    console.error('Password reset failed:', error?.message ?? error)
    return NextResponse.json({ error: 'No se pudo cambiar la contraseña. Inténtalo de nuevo.' }, { status: 500 })
  }
}
