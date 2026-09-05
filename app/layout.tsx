import type { Metadata } from 'next'
import { Manrope, Libre_Caslon_Text } from 'next/font/google'
import './globals.css'
import { PrepProvider } from '@/context/PrepContext'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const caslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-caslon',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PrepPilot — AI Resume Coach & Mock Interview Agent',
  description:
    'Upload your resume, get interviewed by AI, receive rubric-graded feedback, and walk away with a high-impact, ATS-optimized resume in one seamless flow.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`light ${manrope.variable} ${caslon.variable} bg-background`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-background text-on-surface min-h-screen flex flex-col antialiased selection:bg-secondary-container selection:text-on-secondary-container">
        <PrepProvider>{children}</PrepProvider>
      </body>
    </html>
  )
}
