import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import ServiceWorkerRegistration from '@/components/layout/ServiceWorkerRegistration'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})


export const metadata: Metadata = {
  title: 'ClassmateHub — BVM IT Department',
  description:
    'Class platform for course materials, lab guides, deadlines, and polls for BVM Engineering IT students.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-page text-primary">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            className:
              '!bg-white dark:!bg-[hsl(225,16%,11%)] !text-gray-900 dark:!text-gray-100 !border !border-gray-200 dark:!border-[hsl(228,18%,22%)] !rounded-xl !text-sm !shadow-lg',
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
