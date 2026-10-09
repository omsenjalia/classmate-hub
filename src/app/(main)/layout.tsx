import TabBar from '@/components/layout/TabBar'
import DesktopNav from '@/components/layout/DesktopNav'
import AppDataProvider from '@/components/layout/AppDataProvider'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppDataProvider>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-tile focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <DesktopNav />
      <main
        id="content"
        className="mx-auto w-full max-w-5xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-16"
      >
        {children}
      </main>
      <TabBar />
    </AppDataProvider>
  )
}
