import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { z } from 'zod'
import { PREP_TTS_MODEL } from '@/lib/ai/schemas'

export const maxDuration = 60

const bodySchema = z.object({
  text: z.string().min(1).max(2000),
  // Gemini prebuilt voice name. "Kore" is a firm, professional voice.
  voice: z.string().optional().default('Kore'),
})

/**
 * Server-side TTS via the Gemini generateContent endpoint. Gemini returns raw
 * 16-bit PCM at 24kHz, which we wrap in a WAV container so the browser <audio>
 * element can play it. The client falls back to the Web Speech API if this
 * route is unavailable.
 */
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 503 })
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${PREP_TTS_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: parsed.data.text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: parsed.data.voice },
              },
            },
          },
        }),
      }
    )

    if (!res.ok) {
      console.log('[v0] gemini tts http error:', res.status, await res.text())
      return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 })
    }

    const json = await res.json()
    const part = json?.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data?: string } }) => p.inlineData?.data
    )
    const b64: string | undefined = part?.inlineData?.data
    if (!b64) {
      return NextResponse.json({ error: 'TTS returned no audio' }, { status: 503 })
    }

    const pcm = Buffer.from(b64, 'base64')
    const wav = pcmToWav(pcm, 24000, 1, 16)

    return new NextResponse(new Uint8Array(wav), {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.log('[v0] tts error:', (err as Error).message)
    return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 })
  }
}

// Wrap raw PCM samples in a minimal WAV (RIFF) container.
function pcmToWav(pcm: Buffer, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const blockAlign = (channels * bitsPerSample) / 8
  const byteRate = sampleRate * blockAlign
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}
