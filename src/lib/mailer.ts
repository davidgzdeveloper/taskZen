import nodemailer from 'nodemailer'

/**
 * Outgoing email over SMTP. Works with any provider; for Gmail use
 * smtp.gmail.com:465 and an app password (https://myaccount.google.com/apppasswords).
 *
 * SMTP_HOST, SMTP_PORT (default 465), SMTP_USER, SMTP_PASS, MAIL_FROM (default SMTP_USER)
 */

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return transporter
}

export async function sendMail(options: { to: string; subject: string; text: string; html: string }) {
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || `TaskZen <${process.env.SMTP_USER}>`,
    ...options,
  })
}

/** Base URL for links in emails. Never taken from request headers in production (they can be spoofed). */
export function appBaseUrl(requestOrigin: string): string | null {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return process.env.NODE_ENV === 'production' ? null : requestOrigin
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export function passwordResetEmail(name: string | null, link: string) {
  const greeting = name ? `Hola, ${escapeHtml(name)}:` : 'Hola:'
  const text = `${name ? `Hola, ${name}:` : 'Hola:'}

Alguien pidió restablecer la contraseña de tu cuenta de TaskZen. Si fuiste tú, abre este enlace para elegir una nueva:

${link}

El enlace caduca en 1 hora y solo sirve una vez. Si no lo pediste, ignora este correo: tu contraseña no cambia.`

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#18202E">
  <p style="margin:0 0 20px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#F0AA2A"></span>
  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#F0AA2A"></span>
  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;border:1.5px solid #F0AA2A"></span>
  <strong style="margin-left:6px;font-size:18px">TaskZen</strong></p>
  <p>${greeting}</p>
  <p>Alguien pidió restablecer la contraseña de tu cuenta de TaskZen. Si fuiste tú, elige una nueva:</p>
  <p style="margin:28px 0"><a href="${link}" style="background:#2C47D1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Elegir contraseña nueva</a></p>
  <p style="color:#5B6577;font-size:14px">El enlace caduca en 1 hora y solo sirve una vez. Si no lo pediste, ignora este correo: tu contraseña no cambia.</p>
  <p style="color:#5B6577;font-size:12px;word-break:break-all">Si el botón no funciona, copia este enlace: ${link}</p>
</div>`

  return { subject: 'Restablece tu contraseña de TaskZen', text, html }
}
