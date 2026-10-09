'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr'
import { IconButton } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title?: string
  /** Shows a back arrow; falls back to this href when there is no history. */
  backHref?: string
  actions?: React.ReactNode
  /** Small line under the title (counts, context). */
  meta?: React.ReactNode
  className?: string
}

/**
 * Large title that sits at the top of each screen. On phones the bar with
 * the back button and actions sticks while the content scrolls under it.
 */
export default function PageHeader({ title, backHref, actions, meta, className }: PageHeaderProps) {
  const router = useRouter()

  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push(backHref || '/materials')
  }

  return (
    <header className={cn('pt-[env(safe-area-inset-top)]', className)}>
      {(backHref || actions) && (
        <div className="-mx-2 flex h-14 items-center justify-between gap-2">
          {backHref ? (
            <IconButton label="Back" onClick={goBack}>
              <ArrowLeftIcon className="size-[22px]" />
            </IconButton>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1">{actions}</div>
        </div>
      )}
      {title && (
        <div className={cn(!(backHref || actions) && 'pt-6 md:pt-8')}>
          <h1 className="text-[28px] font-semibold leading-tight md:text-3xl">{title}</h1>
          {meta && <div className="mt-1 text-sm text-muted">{meta}</div>}
        </div>
      )}
    </header>
  )
}
