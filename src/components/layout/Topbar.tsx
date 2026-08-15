'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import {
  Menu,
  Search,
  Upload,
  User,
  LogOut,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Topbar() {
  const router = useRouter()
  const { user, searchQuery, setSearchQuery, toggleSidebar, logout, theme, setTheme } = useAppStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/materials?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return (
    <header className="h-16 bg-[#1A1D27]/80 backdrop-blur-md border-b border-[#2D3148] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-[#8B91A8] hover:text-white rounded-lg hover:bg-[#242736] transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#8B91A8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syllabus notes, lab code, materials..."
            className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8B91A8]/60 focus:outline-none focus:border-[#4F6EF7] transition-all"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Upload Button */}
        {user && (
          <Link
            href="/materials/upload"
            className="hidden sm:flex items-center gap-2 bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-[#4F6EF7]/20"
          >
            <Plus className="w-4 h-4" /> Upload
          </Link>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-[#8B91A8] hover:text-white rounded-lg hover:bg-[#242736] transition-colors"
          title="Toggle Dark Mode"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => toast('No new notifications', { icon: '🔔' })}
          className="p-2 text-[#8B91A8] hover:text-white rounded-lg hover:bg-[#242736] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4F6EF7]" />
        </button>

        {/* User Menu Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#242736] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#4F6EF7]/20 border border-[#4F6EF7]/40 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-[#4F6EF7]">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-[#1A1D27] border border-[#2D3148] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-[#2D3148] mb-1">
                  <p className="text-xs font-bold text-white truncate">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-[10px] text-[#8B91A8] font-mono truncate">@{user.username}</p>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded mt-1.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Site Administrator
                    </span>
                  )}
                </div>

                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#E8EAF0] hover:bg-[#242736] rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-[#8B91A8]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/materials/upload"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#E8EAF0] hover:bg-[#242736] rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#8B91A8]" />
                  <span>Upload Material</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="my-1 border-t border-[#2D3148]" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-4 py-2 rounded-lg transition-all shadow-sm shadow-[#4F6EF7]/20"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
