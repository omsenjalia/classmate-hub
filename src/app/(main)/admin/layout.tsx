'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import {
  ShieldCheck,
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Users,
  Megaphone,
  Clock,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useAppStore()

  const isAdmin = user?.role === 'admin'

  if (!user || !isAdmin) {
    return (
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display text-white">Administrator Access Required</h2>
        <p className="text-xs text-[#8B91A8]">
          This section is restricted to the Class Admin account. You can log in using the demo admin account button on the Sign In page.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#4F6EF7] text-white text-xs font-medium px-4 py-2 rounded-xl"
        >
          Go to Sign In
        </Link>
      </div>
    )
  }

  const adminTabs = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Subjects & Labs', href: '/admin/subjects', icon: BookOpen },
    { label: 'Materials Storage', href: '/admin/materials', icon: FolderKanban },
    { label: 'Student Directory', href: '/admin/users', icon: Users },
    { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  ]

  return (
    <div className="space-y-6">
      {/* Admin Subheader Navigation */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-display">ClassmateHub Control Panel</h2>
            <p className="text-[10px] text-[#8B91A8] font-mono">Single Owner Admin Session</p>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {adminTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0',
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-[#8B91A8] hover:text-white hover:bg-[#242736]'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {children}
    </div>
  )
}
