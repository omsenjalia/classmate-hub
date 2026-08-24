import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
}

/** Centered placeholder card shown when a list has nothing to render. */
export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center space-y-3">
      <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  )
}
