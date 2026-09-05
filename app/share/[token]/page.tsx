import Link from 'next/link'
import ResumeDocument from '@/components/ResumeDocument'
import { emptyResume } from '@/data/initialData'
import { db } from '@/lib/db'
import { prepSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function getSharedSession(token: string) {
  const rows = await db.select({ resume: prepSessions.resume, targetRole: prepSessions.targetRole, feedback: prepSessions.feedback, rewrites: prepSessions.rewrites, selectedTemplate: prepSessions.selectedTemplate }).from(prepSessions).where(eq(prepSessions.shareToken, token)).limit(1)
  return rows[0] || null
}

export default async function SharedSessionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const session = await getSharedSession(token)

  if (!session) {
    return <main className="min-h-screen grid place-items-center bg-background px-6"><div className="text-center"><h1 className="font-serif text-4xl text-primary">Session unavailable</h1><p className="mt-3 text-on-surface-variant">This shared link is invalid or has expired.</p><Link href="/upload" className="inline-block mt-6 underline text-secondary">Create your own session</Link></div></main>
  }

  const feedbackEntries = session.feedback && typeof session.feedback === 'object'
    ? Object.entries(session.feedback as Record<string, unknown>)
    : []

  return <main className="min-h-screen bg-background px-4 py-10 sm:px-8"><div className="mx-auto max-w-5xl"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-secondary">Shared PrepPilot session</p><h1 className="mt-2 font-serif text-4xl text-primary">{session.targetRole || 'Interview preparation'}</h1><p className="mt-2 text-sm text-on-surface-variant">Read-only results shared by the candidate.</p></div><Link href="/upload" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary">Try PrepPilot</Link></div><section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"><ResumeDocument resume={session.resume || emptyResume} rewrites={session.rewrites || []} template={session.selectedTemplate || 'modern-atelier'} /></section>{session.feedback && <section className="mt-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6"><h2 className="font-serif text-2xl text-primary">Interview feedback</h2>{feedbackEntries.length > 0 ? <div className="mt-4 grid gap-4 sm:grid-cols-2">{feedbackEntries.map(([key, value]) => <article key={key} className="rounded-xl border border-outline-variant bg-surface-container-low p-4"><h3 className="text-xs font-bold uppercase tracking-wider text-secondary">{key.replace(/([A-Z])/g, ' $1').trim()}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-on-surface-variant">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</p></article>)}</div> : <p className="mt-4 text-sm text-on-surface-variant">Feedback is not available for this session yet.</p>}</section>}</div></main>
}
