import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ClassmateHub | BVM IT Department Class Platform',
  description: 'All-in-one community platform for course materials, lab guides, real-time chat, deadlines, and polls.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="bg-[#0F1117] text-[#E8EAF0] antialiased min-h-screen selection:bg-[#4F6EF7]/30 selection:text-white">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1D27',
              color: '#E8EAF0',
              border: '1px solid #2D3148',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
