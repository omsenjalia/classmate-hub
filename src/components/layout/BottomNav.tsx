'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Vote,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Materials', href: '/materials', icon: FolderKanban },
  { label: 'Polls', href: '/polls', icon: Vote },
  { label: 'Events', href: '/events', icon: Calendar },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[hsl(225,16%,11%)]/90 backdrop-blur-lg border-t border-gray-200 dark:border-[hsl(228,18%,22%)] safe-bottom">
      <div className="flex items-center justify-around gap-1 px-2 pt-1.5 pb-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-lg min-w-[56px] transition-colors',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-indigo-600 dark:text-indigo-400')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
