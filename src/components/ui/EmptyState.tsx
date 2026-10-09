import type { Icon } from '@phosphor-icons/react'

interface EmptyStateProps {
  icon: Icon
  title: string
  description?: string
  action?: React.ReactNode
}

/** Quiet placeholder for empty lists, errors and gated pages. */
export default function EmptyState({ icon: IconComponent, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-rise flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-card bg-surface-2 text-muted">
        <IconComponent className="size-7" weight="duotone" />
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
