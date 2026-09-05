'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { prepSessions } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { randomBytes, randomUUID } from 'crypto'
import type {
  ParsedResume,
  InterviewQuestion,
  FeedbackReport,
  BulletRewrite,
  TemplateId,
} from '@/types'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export interface PrepSessionState {
  id: string
  resume: ParsedResume | null
  targetRole: string
  targetJD: string
  questions: InterviewQuestion[]
  answers: Record<string, string>
  feedback: FeedbackReport | null
  rewrites: BulletRewrite[]
  selectedTemplate: TemplateId
  status: string
  updatedAt: string
}

export interface SavePayload {
  id?: string
  resume?: ParsedResume | null
  targetRole?: string
  targetJD?: string
  questions?: InterviewQuestion[]
  answers?: Record<string, string>
  feedback?: FeedbackReport | null
  rewrites?: BulletRewrite[]
  selectedTemplate?: TemplateId
  status?: string
}

// Returns the user's most recent session, or null if none exists yet.
export async function getActiveSession(): Promise<PrepSessionState | null> {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(prepSessions)
    .where(eq(prepSessions.userId, userId))
    .orderBy(desc(prepSessions.updatedAt))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  return serialize(row)
}

export async function listSessions(): Promise<PrepSessionState[]> {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(prepSessions)
    .where(eq(prepSessions.userId, userId))
    .orderBy(desc(prepSessions.updatedAt))
  return rows.map(serialize)
}

// Upserts a session. If no id is provided, creates a new one and returns its id.
export async function saveSession(payload: SavePayload): Promise<{ id: string }> {
  const userId = await getUserId()
  const now = new Date()

  if (payload.id) {
    const existing = await db
      .select({ id: prepSessions.id })
      .from(prepSessions)
      .where(and(eq(prepSessions.id, payload.id), eq(prepSessions.userId, userId)))
      .limit(1)

    if (existing[0]) {
      await db
        .update(prepSessions)
        .set({
          ...(payload.resume !== undefined ? { resume: payload.resume } : {}),
          ...(payload.targetRole !== undefined ? { targetRole: payload.targetRole } : {}),
          ...(payload.targetJD !== undefined ? { targetJD: payload.targetJD } : {}),
          ...(payload.questions !== undefined ? { questions: payload.questions } : {}),
          ...(payload.answers !== undefined ? { answers: payload.answers } : {}),
          ...(payload.feedback !== undefined ? { feedback: payload.feedback } : {}),
          ...(payload.rewrites !== undefined ? { rewrites: payload.rewrites } : {}),
          ...(payload.selectedTemplate !== undefined ? { selectedTemplate: payload.selectedTemplate } : {}),
          ...(payload.status !== undefined ? { status: payload.status } : {}),
          updatedAt: now,
        })
        .where(and(eq(prepSessions.id, payload.id), eq(prepSessions.userId, userId)))
      return { id: payload.id }
    }
  }

  const id = payload.id || randomUUID()
  await db.insert(prepSessions).values({
    id,
    userId,
    resume: payload.resume ?? null,
    targetRole: payload.targetRole ?? '',
    targetJD: payload.targetJD ?? '',
    questions: payload.questions ?? [],
    answers: payload.answers ?? {},
    feedback: payload.feedback ?? null,
    rewrites: payload.rewrites ?? [],
    selectedTemplate: payload.selectedTemplate ?? 'modern-atelier',
    status: payload.status ?? 'draft',
    createdAt: now,
    updatedAt: now,
  })
  return { id }
}

export async function createSharedSession(payload: SavePayload): Promise<{ token: string }> {
  const userId = await getUserId()
  const token = randomBytes(18).toString('base64url')
  const now = new Date()
  const id = payload.id || randomUUID()
  const values = {
    id,
    userId,
    resume: payload.resume ?? null,
    targetRole: payload.targetRole ?? '',
    targetJD: payload.targetJD ?? '',
    questions: payload.questions ?? [],
    answers: payload.answers ?? {},
    feedback: payload.feedback ?? null,
    rewrites: payload.rewrites ?? [],
    selectedTemplate: payload.selectedTemplate ?? 'modern-atelier' as TemplateId,
    status: 'shared',
    shareToken: token,
    sharedAt: now,
    createdAt: now,
    updatedAt: now,
  }
  await db.insert(prepSessions).values(values).onConflictDoUpdate({
    target: prepSessions.id,
    set: {
      resume: values.resume,
      targetRole: values.targetRole,
      targetJD: values.targetJD,
      questions: values.questions,
      answers: values.answers,
      feedback: values.feedback,
      rewrites: values.rewrites,
      selectedTemplate: values.selectedTemplate,
      status: values.status,
      shareToken: token,
      sharedAt: now,
      updatedAt: now,
    },
  })
  return { token }
}

export async function deleteSession(id: string): Promise<void> {
  const userId = await getUserId()
  await db.delete(prepSessions).where(and(eq(prepSessions.id, id), eq(prepSessions.userId, userId)))
}

function serialize(row: typeof prepSessions.$inferSelect): PrepSessionState {
  return {
    id: row.id,
    resume: (row.resume as ParsedResume | null) ?? null,
    targetRole: row.targetRole,
    targetJD: row.targetJD,
    questions: (row.questions as InterviewQuestion[]) ?? [],
    answers: (row.answers as Record<string, string>) ?? {},
    feedback: (row.feedback as FeedbackReport | null) ?? null,
    rewrites: (row.rewrites as BulletRewrite[]) ?? [],
    selectedTemplate: (row.selectedTemplate as TemplateId) ?? 'modern-atelier',
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  }
}
