import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

/**
 * Gmail SMTP transport. Uses a Gmail account + App Password (not the normal
 * account password). Create one at https://myaccount.google.com/apppasswords
 * with 2-Step Verification enabled, then set GMAIL_USER and GMAIL_APP_PASSWORD.
 *
 * This is a free alternative to a transactional email provider (like Resend)
 * that requires a verified sending domain.
 */
let cached: Transporter | null = null

function getTransport() {
  if (cached) return cached
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null

  cached = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
  return cached
}

export function isEmailConfigured() {
  return !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD
}

interface SendArgs {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendArgs) {
  const transport = getTransport()
  if (!transport) {
    throw new Error('Email transport is not configured (missing GMAIL_USER / GMAIL_APP_PASSWORD).')
  }
  const fromName = process.env.EMAIL_FROM_NAME || 'PrepPilot'
  await transport.sendMail({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: text || html.replace(/<[^>]+>/g, ' '),
    html,
  })
}

/**
 * Branded password-reset email matching the app's editorial aesthetic.
 */
export function resetPasswordEmail(url: string, userEmail: string) {
  return `
  <div style="max-width:520px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;color:#211f26;background:#fbf8ff;border:1.5px solid #64597a;border-radius:16px;overflow:hidden">
    <div style="padding:28px 32px;border-bottom:1.5px solid #64597a">
      <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a7fa6;font-family:Arial,sans-serif;font-weight:bold">PrepPilot Security</p>
      <h1 style="margin:6px 0 0;font-size:26px;font-weight:400;color:#3f3856">Reset your password</h1>
    </div>
    <div style="padding:28px 32px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#49454e">
      <p style="margin:0 0 16px">We received a request to reset the password for <strong style="color:#3f3856">${userEmail}</strong>.</p>
      <p style="margin:0 0 24px">Click the button below to choose a new password. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      <a href="${url}" style="display:inline-block;background:#211f26;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:999px;font-size:13px;font-weight:bold;border:1.5px solid #211f26">Reset Password</a>
      <p style="margin:24px 0 0;font-size:12px;color:#8a7fa6;word-break:break-all">Or paste this link into your browser:<br/>${url}</p>
    </div>
  </div>`
}
