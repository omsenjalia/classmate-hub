import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isBefore } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a')
  } catch {
    return dateString
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  } catch {
    return dateString
  }
}

export function getDeadlineUrgency(dueDateString: string): {
  label: string
  color: string
  border: string
  bg: string
} {
  try {
    const due = new Date(dueDateString)
    const now = new Date()

    if (isBefore(due, now)) {
      return {
        label: 'Overdue',
        color: 'text-red-500 dark:text-red-400',
        border: 'border-red-200 dark:border-red-500/30',
        bg: 'bg-red-50 dark:bg-red-500/10',
      }
    }

    const diffHours = (due.getTime() - now.getTime()) / (1000 * 3600)
    if (diffHours <= 72) {
      return {
        label: 'Due Soon',
        color: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-500/30',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
      }
    }

    return {
      label: 'Upcoming',
      color: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    }
  } catch {
    return {
      label: 'Upcoming',
      color: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    }
  }
}

const SUBJECT_COLORS = [
  'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
  'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30',
  'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
  'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
  'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/30',
]

export function getSubjectColor(code: string = ''): string {
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % SUBJECT_COLORS.length
  return SUBJECT_COLORS[index]
}

/** Map file type to display info */
export function getFileTypeInfo(fileType?: string | null): {
  label: string
  colorClass: string
} {
  switch (fileType) {
    case 'pdf':
      return { label: 'PDF', colorClass: 'text-red-500 dark:text-red-400' }
    case 'code':
      return { label: 'Code', colorClass: 'text-blue-500 dark:text-blue-400' }
    case 'video':
      return { label: 'Video', colorClass: 'text-indigo-500 dark:text-indigo-400' }
    case 'zip':
      return { label: 'Archive', colorClass: 'text-emerald-500 dark:text-emerald-400' }
    case 'docx':
      return { label: 'Document', colorClass: 'text-blue-500 dark:text-blue-400' }
    case 'image':
      return { label: 'Image', colorClass: 'text-pink-500 dark:text-pink-400' }
    default:
      return { label: 'File', colorClass: 'text-gray-500 dark:text-gray-400' }
  }
}
