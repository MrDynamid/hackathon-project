import { generateObject } from 'ai'
import { NextResponse } from 'next/server'
import { analysisSchema, FAST_THINKING } from '@/lib/ai/schemas'
import { generateGeminiObject } from '@/lib/ai/model'
import type { ModelMessage } from 'ai'

export const maxDuration = 60

/**
 * Single AI-driven endpoint. Accepts an uploaded resume file (PDF/DOCX/TXT)
 * and/or pasted text, plus an optional target role and job description.
 *
 * Gemini analyzes the file NATIVELY (PDFs are sent as a file part, so layout,
 * headings and tables are understood). From that — and the target role — it
 * produces a fully structured, role-tailored resume. If the input is thin or
 * empty, it GENERATES a strong starting point (summary, skills, experience
 * templates, tags) instead of leaving blanks, so the app never needs static
 * fallback templates.
 */
export async function POST(req: Request) {
  // Resume analysis is available to guests; authentication is only required when saving.

  let pastedText = ''
  let targetRole = ''
  let targetJD = ''
  let fileName = ''
  let filePart: { data: Uint8Array; mediaType: string } | null = null
  let extractedText = ''

  const contentType = req.headers.get('content-type') || ''

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      pastedText = ((form.get('pastedText') as string) || '').trim()
      targetRole = ((form.get('targetRole') as string) || '').trim()
      targetJD = ((form.get('targetJD') as string) || '').trim()
      const file = form.get('file') as File | null

      if (file && file.size > 0) {
        fileName = file.name
        const name = file.name.toLowerCase()
        const buffer = new Uint8Array(await file.arrayBuffer())

        if (name.endsWith('.pdf')) {
          // Send the PDF natively — Gemini reads layout/tables directly.
          filePart = { data: buffer, mediaType: 'application/pdf' }
        } else if (name.endsWith('.docx')) {
          const mammoth = await import('mammoth')
          const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
          extractedText = result.value
        } else {
          extractedText = new TextDecoder().decode(buffer)
        }
      }
    } else {
      const body = await req.json()
      pastedText = (body.pastedText || '').trim()
      targetRole = (body.targetRole || '').trim()
      targetJD = (body.targetJD || '').trim()
    }
  } catch {
    return NextResponse.json({ error: 'Could not read the submitted resume.' }, { status: 400 })
  }

  const combinedText = [extractedText, pastedText].filter(Boolean).join('\n\n').trim()
  const hasFile = !!filePart
  const hasText = combinedText.length >= 30

  if (!hasFile && !hasText && !targetRole) {
    return NextResponse.json(
      { error: 'Upload a resume, paste your details, or at least tell us the role you are targeting.' },
      { status: 400 }
    )
  }

  const system =
    'You are PrepPilot, an expert career coach and resume architect. Given whatever the candidate provides ' +
    '(a resume file, pasted notes, and/or just a target role), produce a complete, polished, role-tailored ' +
    'resume as structured JSON. Rules:\n' +
    '1. Extract every real fact present (name, contact, employers, dates, metrics) VERBATIM — never invent ' +
    'employers, dates, or numbers that are not in the source.\n' +
    '2. When information is missing or thin, GENERATE strong, realistic starting content tailored to the ' +
    'target role: a compelling summary, a prioritized skills list, and 1-3 experience entries written as ' +
    'editable templates (use placeholder companies like "Company Name" and role-appropriate, quantifiable ' +
    'bullet templates such as "Edited X+ videos per month, growing channel views by Y%"). Mark these clearly ' +
    'in aiNotes and set wasAugmented=true.\n' +
    '3. Always fill suggestedSkills (8-15 role-critical skills the candidate should have/highlight) and ' +
    'suggestedTags (5-8 short keywords/specialties for the role, e.g. for a video editor: "Premiere Pro", ' +
    '"Color Grading", "Motion Graphics", "YouTube", "Short-form").\n' +
    '4. Infer a concise professional title matching the target role if none is stated.\n' +
    '5. Generate stable ids like "exp-1", "edu-1".\n' +
    '6. aiNotes: 2-5 short bullet strings explaining what you inferred, generated, or tailored.'

  const userText =
    `TARGET ROLE: ${targetRole || '(not specified — infer from the resume)'}\n\n` +
    `JOB DESCRIPTION / FOCUS:\n${targetJD || '(not provided)'}\n\n` +
    (hasText ? `CANDIDATE-PROVIDED TEXT:\n${combinedText.slice(0, 20000)}` : '') +
    (hasFile ? '\n\nThe candidate also attached their resume file (see attachment). Read it fully.' : '') +
    (!hasFile && !hasText
      ? '\n\nThe candidate provided only a target role. Generate a strong, editable starter resume for this role.'
      : '')

  const messages: ModelMessage[] = [
    {
      role: 'user',
      content: filePart
        ? [
            { type: 'text', text: userText },
            { type: 'file', data: filePart.data, mediaType: filePart.mediaType },
          ]
        : userText,
    },
  ]

  try {
    const { object } = await generateGeminiObject({
      model: PREP_MODEL,
      schema: analysisSchema,
      system,
      messages,
      providerOptions: FAST_THINKING,
    })

    return NextResponse.json({
      resume: { ...object.resume, rawText: combinedText },
      aiNotes: object.aiNotes,
      wasAugmented: object.wasAugmented,
      fileName,
    })
  } catch (err) {
    console.log('[v0] parse-resume error:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to analyze the resume. Please try again.' }, { status: 500 })
  }
}
