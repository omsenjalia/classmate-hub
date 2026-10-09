'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/ssr'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { getNavItems } from '@/components/layout/nav'
import { ButtonLink } from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Logo from '@/components/layout/Logo'

/** Tablet/desktop top bar. Phones use the TabBar instead. */
export default function DesktopNav() {
  const pathname = usePathname()
  const user = useAppStore((state) => state.user)
  const items = getNavItems(user).filter((item) => !item.primary)
  const [profileItem] = items.splice(-1)

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-bg/90 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-8 px-6">
        <Logo />
        <nav aria-label="Primary" className="flex items-center gap-1">
          {items.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ButtonLink href="/materials/upload" size="sm">
            <UploadSimpleIcon className="size-4" weight="bold" /> Upload
          </ButtonLink>
          {user ? (
            <Link href={profileItem.href} aria-label="Your profile" className="rounded-[30%]">
              <Avatar profile={user} />
            </Link>
          ) : (
            <ButtonLink href="/login" variant="secondary" size="sm">
              Sign in
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  )
}
