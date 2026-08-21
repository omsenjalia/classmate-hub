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
      <div className="editorial-grid flex h-screen bg-page overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* Mobile Drawer */}
      <MobileNav />

      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="editorial-noise relative flex-1 min-h-0 overflow-y-auto px-4 py-5 sm:p-6 lg:p-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
      </div>
    </AppDataProvider>
  )
}
