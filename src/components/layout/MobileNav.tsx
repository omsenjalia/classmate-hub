'use client'

import { useAppStore } from '@/store/useAppStore'
import Sidebar from './Sidebar'
import { X } from 'lucide-react'

export default function MobileNav() {
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  if (!sidebarOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Drawer */}
      <div className="relative z-10 w-[260px] h-full shadow-2xl animate-in slide-in-from-left duration-200">
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-3 text-[#8B91A8] hover:text-white p-1 rounded-lg hover:bg-[#242736] z-20"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        <Sidebar className="w-full" />
      </div>
    </div>
  )
}
