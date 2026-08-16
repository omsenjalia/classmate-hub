'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Vote,
  Calendar,
  Clock,
  ShieldCheck,
  Hash,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { user, channels, subjects, setSidebarOpen } = useAppStore()

  const mainNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Materials', href: '/materials', icon: FolderKanban },
    { label: 'Chat', href: '/chat/general', icon: MessageSquare },
    { label: 'Polls', href: '/polls', icon: Vote },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'Deadlines', href: '/deadlines', icon: Clock },
  ]

  const globalChannels = channels.filter((c) => !c.subject_id)
  const subjectChannels = channels.filter((c) => c.subject_id !== null)
  const isAdmin = user?.role === 'admin'

  return (
    <aside
      className={cn(
        'w-[260px] bg-white dark:bg-[hsl(225,16%,11%)] border-r border-gray-200 dark:border-[hsl(228,18%,22%)] flex flex-col h-screen select-none',
        className
      )}
    >
      {/* Brand */}
      <div className="h-16 px-5 border-b border-gray-200 dark:border-[hsl(228,18%,22%)] flex items-center">
        <Link
          href="/dashboard"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[hsl(225,20%,7%)] border border-gray-200 dark:border-[hsl(228,18%,22%)] flex items-center justify-center p-1 group-hover:scale-105 transition-transform overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="BVM Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white leading-tight text-[15px]">
              ClassmateHub
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">BVM IT • Sem 1</p>
          </div>
        </Link>
      </div>

      {/* Nav Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Upload CTA */}
        {user && (
          <Link
            href="/materials/upload"
            onClick={() => setSidebarOpen(false)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload Material
          </Link>
        )}

        {/* Main Nav */}
        <div className="space-y-0.5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Navigation
          </p>
          {mainNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-[18px] h-[18px]', isActive && 'text-indigo-600 dark:text-indigo-400')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="space-y-0.5 pt-2 border-t border-gray-200 dark:border-[hsl(228,16%,18%)]">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              Admin
            </p>
            <Link
              href="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-gray-100 dark:hover:bg-white/5'
              )}
            >
              <ShieldCheck className="w-[18px] h-[18px] text-amber-600 dark:text-amber-400" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}

        {/* Global Channels */}
        {globalChannels.length > 0 && (
          <div className="space-y-0.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Channels
            </p>
            {globalChannels.map((channel) => {
              const channelPath = `/chat/${channel.id}`
              const isActive = pathname === channelPath
              return (
                <Link
                  key={channel.id}
                  href={channelPath}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                  )}
                >
                  <Hash className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{channel.name}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Subject Channels */}
        {subjects.length > 0 && (
          <div className="space-y-0.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Subjects
            </p>
            {subjects.map((sub) => {
              const channel = subjectChannels.find((c) => c.subject_id === sub.id) || {
                id: `chan-${sub.code.toLowerCase()}`,
                name: sub.code.toLowerCase(),
              }
              const channelPath = `/chat/${channel.id}`
              const isActive = pathname === channelPath

              return (
                <Link
                  key={sub.id}
                  href={channelPath}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                  )}
                >
                  <Hash className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="truncate">{sub.code}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-[hsl(228,18%,22%)]">
        {user ? (
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.display_name || user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </aside>
  )
}
