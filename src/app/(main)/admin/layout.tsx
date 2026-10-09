'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LockKeyIcon } from '@phosphor-icons/react/dist/ssr'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'

const TABS = [
  { label: 'Materials', href: '/admin/materials' },
  { label: 'Subjects', href: '/admin/subjects' },
  { label: 'People', href: '/admin/users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useAppStore((state) => state.user)

  if (user?.role !== 'admin') {
    return (
      <EmptyState
        icon={LockKeyIcon}
        title="Admins only"
        description="Sign in with the class admin account to manage materials and subjects."
        action={<ButtonLink href="/login?next=/admin/materials">Sign in</ButtonLink>}
      />
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Admin" backHref={`/profile/${user.username}`} />
      <nav aria-label="Admin sections" className="grid grid-cols-3 gap-1 rounded-[12px] bg-surface-2 p-1">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-10 items-center justify-center rounded-[9px] text-sm font-medium transition-colors',
                active ? 'bg-surface text-ink shadow-float' : 'text-muted hover:text-ink'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
      {children}
    </div>
  )
}
