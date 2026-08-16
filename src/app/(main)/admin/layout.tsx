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
      <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-500/40">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Administrator Access Required</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This section is restricted to the Class Admin account. Sign in with an admin account to access the control panel.
        </p>
        <Link
          href="/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
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
      <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">ClassmateHub Control Panel</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">Single Owner Admin Session</p>
          </div>
        </div>

        {/* Scrollable tabs with fade indicators */}
        <div className="relative">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
            {adminTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0',
                    isActive
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              )
            })}
          </div>
          {/* Right scroll fade indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800/60 to-transparent pointer-events-none sm:hidden" />
        </div>
      </div>

      {children}
    </div>
  )
}
