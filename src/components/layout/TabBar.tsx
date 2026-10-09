'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { getNavItems, hidesTabBar } from '@/components/layout/nav'

/** Phone-only bottom navigation. Thumb-reachable, 5 slots, upload in the middle. */
export default function TabBar() {
  const pathname = usePathname()
  const user = useAppStore((state) => state.user)

  if (hidesTabBar(pathname)) return null

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {getNavItems(user).map((item) => {
          const Icon = item.icon
          const active = item.match(pathname)

          if (item.primary) {
            return (
              <li key={item.href} className="flex items-center justify-center">
                <Link
                  href={item.href}
                  aria-label="Upload material"
                  aria-current={active ? 'page' : undefined}
                  className="pressable flex size-12 items-center justify-center rounded-[14px] bg-accent text-accent-ink shadow-float"
                >
                  <Icon className="size-6" weight="bold" />
                </Link>
              </li>
            )
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'pressable flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium',
                  active ? 'text-ink' : 'text-muted'
                )}
              >
                <Icon className="size-6" weight={active ? 'fill' : 'regular'} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
