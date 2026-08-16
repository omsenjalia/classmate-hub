'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import {
  Menu,
  Search,
  User,
  LogOut,
  ShieldCheck,
  Upload,
  Sun,
  Moon,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Topbar() {
  const router = useRouter()
  const { user, searchQuery, setSearchQuery, toggleSidebar, logout, theme, toggleTheme } =
    useAppStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/materials?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    router.push('/login')
  }

  return (
    <header className="h-16 bg-white/80 dark:bg-[hsl(225,16%,11%)]/80 backdrop-blur-md border-b border-gray-200 dark:border-[hsl(228,18%,22%)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials..."
            className="w-full bg-gray-100 dark:bg-[hsl(225,20%,7%)] border border-gray-200 dark:border-[hsl(228,18%,22%)] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Upload (desktop) */}
        {user && (
          <Link
            href="/materials/upload"
            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload
          </Link>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* User Menu */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[hsl(225,16%,11%)] border border-gray-200 dark:border-[hsl(228,18%,22%)] rounded-xl shadow-lg dark:shadow-2xl p-1.5 z-50 animate-fade-in">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-[hsl(228,16%,18%)] mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user.username}
                  </p>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded mt-1.5 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>

                <Link
                  href={`/profile/${user.username}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Profile
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Admin Panel
                  </Link>
                )}

                <div className="my-1 border-t border-gray-100 dark:border-[hsl(228,16%,18%)]" />

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
