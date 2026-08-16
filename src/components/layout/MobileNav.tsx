'use client'

import { useAppStore } from '@/store/useAppStore'
import Sidebar from './Sidebar'
import { X } from 'lucide-react'

export default function MobileNav() {
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  if (!sidebarOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Drawer */}
      <div className="relative z-10 w-[280px] h-full shadow-2xl animate-slide-in-left">
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-3 text-gray-400 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 z-20 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        <Sidebar className="w-full" />
      </div>
    </div>
  )
}
