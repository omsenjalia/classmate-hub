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
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { user, channels, subjects, setSidebarOpen } = useAppStore()

  const mainNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Materials', href: '/materials', icon: FolderKanban },
    { label: 'Chat Channels', href: '/chat/chan-gen', icon: MessageSquare },
    { label: 'Polls & Votes', href: '/polls', icon: Vote },
    { label: 'Events Calendar', href: '/events', icon: Calendar },
    { label: 'Shared Deadlines', href: '/deadlines', icon: Clock },
  ]

  const globalChannels = channels.filter((c) => !c.subject_id)
  const subjectChannels = channels.filter((c) => c.subject_id !== null)

  const isAdmin = user?.role === 'admin'

  return (
    <aside
      className={cn(
        'w-[250px] bg-[#1A1D27] border-r border-[#2D3148] flex flex-col h-screen select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#2D3148] flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4F6EF7] to-[#3B55D4] flex items-center justify-center shadow-md shadow-[#4F6EF7]/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white font-display leading-tight tracking-tight text-base">
              ClassmateHub
            </h2>
            <p className="text-[10px] text-[#8B91A8] font-mono">BVM IT • Sem 1</p>
          </div>
        </Link>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Quick Upload CTA */}
        {user && (
          <Link
            href="/materials/upload"
            onClick={() => setSidebarOpen(false)}
            className="w-full bg-[#4F6EF7] hover:bg-[#3B55D4] text-white rounded-lg px-3 py-2 text-xs font-medium flex items-center justify-center gap-2 shadow-sm shadow-[#4F6EF7]/20 transition-all"
          >
            <Upload className="w-4 h-4" /> Upload Material
          </Link>
        )}

        {/* Main Links */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8B91A8] mb-2">
            Platform
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
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative',
                  isActive
                    ? 'bg-[#242736] text-white border-l-2 border-[#4F6EF7]'
                    : 'text-[#8B91A8] hover:text-white hover:bg-[#242736]/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-[#4F6EF7]' : 'text-[#8B91A8]')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="space-y-1 pt-2 border-t border-[#2D3148]/60">
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-400">
                Admin Controls
              </p>
              <ShieldCheck className="w-3 h-3 text-amber-400" />
            </div>
            <Link
              href="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400'
                  : 'text-[#8B91A8] hover:text-amber-300 hover:bg-[#242736]/60'
              )}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Admin Management</span>
            </Link>
          </div>
        )}

        {/* Global Channels */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8B91A8] mb-2">
            Global Channels
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
                  'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#242736] text-white font-semibold'
                    : 'text-[#8B91A8] hover:text-white hover:bg-[#242736]/60'
                )}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-[#8B91A8]" />
                  <span>{channel.name}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Subject Channels */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8B91A8] mb-2">
            Subject Discussions
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
                  'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#242736] text-white font-semibold'
                    : 'text-[#8B91A8] hover:text-white hover:bg-[#242736]/60'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash className="w-3.5 h-3.5 text-[#4F6EF7]" />
                  <span className="truncate">{sub.code} • {sub.name}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#2D3148] bg-[#0F1117]/50">
        {user ? (
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#242736] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#4F6EF7]/20 border border-[#4F6EF7]/40 flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-[#4F6EF7]">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">
                {user.display_name || user.username}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#8B91A8] font-mono truncate">@{user.username}</span>
                {isAdmin && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded">
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            className="w-full bg-[#242736] hover:bg-[#2D3148] text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            Sign In / Register
          </Link>
        )}
      </div>
    </aside>
  )
}
