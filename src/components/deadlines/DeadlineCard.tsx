'use client'

import { Calendar, Trash2 } from 'lucide-react'
import { Deadline } from '@/lib/types'
import { formatDate, formatRelativeTime, getDeadlineUrgency, getSubjectColor } from '@/lib/utils'

interface DeadlineCardProps {
  deadline: Deadline
  canDelete: boolean
  onDelete: (deadlineId: string) => void
}

export default function DeadlineCard({ deadline: item, canDelete, onDelete }: DeadlineCardProps) {
  const urgency = getDeadlineUrgency(item.due_date)

  return (
    <div
      className={`bg-white dark:bg-gray-800/60 border ${urgency.border} rounded-2xl p-5 sm:p-6 space-y-4 transition-all shadow-sm relative overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${urgency.bg} ${urgency.color} ${urgency.border}`}
            >
              {urgency.label}
            </span>

            {item.subjects && (
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getSubjectColor(
                  item.subjects.code
                )}`}
              >
                {item.subjects.code}
              </span>
            )}

            <span className="text-[11px] font-mono uppercase text-gray-500 dark:text-gray-400">
              Type: {item.type}
            </span>
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {item.title}
          </h2>

          {item.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
          )}
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Delete Deadline"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span className="flex items-center gap-1.5 text-gray-900 dark:text-white font-semibold">
          <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Due: {formatDate(item.due_date)}
        </span>
        <span className={urgency.color}>{formatRelativeTime(item.due_date)}</span>
      </div>
    </div>
  )
}
