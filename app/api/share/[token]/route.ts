import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { prepSessions } from '@/lib/db/schema'

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const rows = await db.select({
    resume: prepSessions.resume,
    targetRole: prepSessions.targetRole,
    questions: prepSessions.questions,
    answers: prepSessions.answers,
    feedback: prepSessions.feedback,
    rewrites: prepSessions.rewrites,
    selectedTemplate: prepSessions.selectedTemplate,
    sharedAt: prepSessions.sharedAt,
  }).from(prepSessions).where(eq(prepSessions.shareToken, token)).limit(1)

  if (!rows[0]) return NextResponse.json({ error: 'Shared session not found' }, { status: 404 })
  return NextResponse.json(rows[0], { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } })
}
