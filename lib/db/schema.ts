import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import type {
  ParsedResume,
  InterviewQuestion,
  FeedbackReport,
  BulletRewrite,
  TemplateId,
} from '@/types'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  issuer: text('issuer'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// A prep session holds the full flow: parsed resume, target role, generated
// questions, transcript answers, feedback report, and bullet rewrites.
// Scoped per user via the plain `userId` column (no FK by default).

export const prepSessions = pgTable('prep_sessions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  resume: jsonb('resume').$type<ParsedResume>(),
  targetRole: text('targetRole').notNull().default(''),
  targetJD: text('targetJD').notNull().default(''),
  questions: jsonb('questions').$type<InterviewQuestion[]>().notNull().default([]),
  answers: jsonb('answers').$type<Record<string, string>>().notNull().default({}),
  feedback: jsonb('feedback').$type<FeedbackReport | null>(),
  rewrites: jsonb('rewrites').$type<BulletRewrite[]>().notNull().default([]),
  selectedTemplate: text('selectedTemplate').$type<TemplateId>().notNull().default('modern-atelier'),
  status: text('status').notNull().default('draft'),
  shareToken: text('shareToken').unique(),
  sharedAt: timestamp('sharedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export type PrepSessionRow = typeof prepSessions.$inferSelect
