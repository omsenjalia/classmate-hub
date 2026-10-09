import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import ServiceWorkerRegistration from '@/components/layout/ServiceWorkerRegistration'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ClassmateHub',
    template: '%s · ClassmateHub',
  },
  description:
    'Lecture notes, lab manuals, solution code and recorded lectures for BVM Engineering IT students.',
  appleWebApp: {
    capable: true,
    title: 'ClassmateHub',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#121311' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-bg text-ink antialiased">
        <Toaster
          position="top-center"
          containerStyle={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--ink)',
              color: 'var(--bg)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '10px 14px',
            },
          }}
        />
        <ServiceWorkerRegistration />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
