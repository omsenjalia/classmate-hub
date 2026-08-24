import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon: LucideIcon
  iconClassName?: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

/** Standard page heading: colored icon + title + subtitle, optional action slot. */
export default function PageHeader({
  icon: Icon,
  iconClassName = 'w-6 h-6 text-indigo-500',
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Icon className={iconClassName} /> {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3 self-start sm:self-auto">{actions}</div>}
    </div>
  )
}
