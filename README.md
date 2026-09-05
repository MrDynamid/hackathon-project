# PrepPilot — AI Resume Coach & Mock Interview Agent

A single-pipeline career atelier: upload a resume, run a rubric-backed mock interview grounded in your actual experience, get evidence-based feedback, and walk away with rewritten, metric-driven bullet points and a polished PDF.

## Tech Stack

- **Framework**: Next.js (App Router) + React + TypeScript
- **Styling**: Tailwind CSS — "Ethereal Clarity" design system (display serif headings, soft lavender accents, light/dark themes)
- **Database**: Neon (Postgres) via `pg` + Drizzle ORM
- **Auth**: Better Auth (email + password, session cookies)
- **AI**: Vercel AI SDK through AI Gateway (resume parsing, question generation, answer evaluation, bullet rewriting)

## The Flow

1. **Upload & Target** (`/upload`) — Drop a PDF/DOCX/TXT resume or paste text, with an optional target role. The AI parses skills, stacks, and milestones.
2. **Review Resume** (`/review`) — Edit the parsed resume before the interview.
3. **Interview Room** (`/interview`) — 5 personalized, rubric-backed questions with browser voice mode (TTS + speech), a realistic timer, and autosave.
4. **Feedback Report** (`/feedback`) — Granular rubric scores grounded in quotes from your answers.
5. **Improvement Studio** (`/improve`) — AI rewrites your bullet points with real metrics.
6. **Download** (`/download`) — Export the polished resume as a PDF.

Public pages: landing (`/`), `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/terms`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string (provided by the Neon integration) |
| `BETTER_AUTH_SECRET` | Secret for Better Auth session signing |

AI Gateway authentication is zero-config on Vercel and in v0 previews — no key required.

## Database Setup

The schema lives in `lib/db/schema.ts`. Tables: `user`, `session`, `account`, `verification`, and `prep_sessions`. To (re)create tables against your `DATABASE_URL`:

\`\`\`bash
node --env-file=.env.development.local scripts/setup-db.mjs
\`\`\`

## Development

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

The app runs at `http://localhost:3000`.
