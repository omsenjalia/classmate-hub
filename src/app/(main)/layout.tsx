import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import MobileNav from '@/components/layout/MobileNav'
import BottomNav from '@/components/layout/BottomNav'
import AppDataProvider from '@/components/layout/AppDataProvider'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppDataProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-[hsl(225,20%,7%)] overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* Mobile Drawer */}
      <MobileNav />

      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
      </div>
    </AppDataProvider>
  )
}
