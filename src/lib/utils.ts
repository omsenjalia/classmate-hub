import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNowStrict, differenceInDays } from 'date-fns'
import type { Material } from '@/lib/types'

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
    return format(new Date(dateString), 'd MMM yyyy')
  } catch {
    return dateString
  }
}

/** "3d ago" for the last two weeks, a plain date after that. */
export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (differenceInDays(new Date(), date) < 14) {
      return formatDistanceToNowStrict(date, { addSuffix: true })
    }
    return format(date, 'd MMM')
  } catch {
    return dateString
  }
}

export type FileKind = 'pdf' | 'code' | 'video' | 'zip' | 'docx' | 'image' | 'file'

export const FILE_KINDS: { value: FileKind; label: string }[] = [
  { value: 'pdf', label: 'PDFs' },
  { value: 'code', label: 'Code' },
  { value: 'video', label: 'Videos' },
  { value: 'docx', label: 'Docs' },
  { value: 'image', label: 'Images' },
  { value: 'zip', label: 'Archives' },
]

export function getFileKind(material: Pick<Material, 'file_type' | 'video_url'>): FileKind {
  if (material.video_url) return 'video'
  switch (material.file_type) {
    case 'pdf':
    case 'code':
    case 'video':
    case 'zip':
    case 'docx':
    case 'image':
      return material.file_type
    default:
      return 'file'
  }
}

export function getFileKindLabel(kind: FileKind): string {
  switch (kind) {
    case 'pdf':
      return 'PDF'
    case 'code':
      return 'Code'
    case 'video':
      return 'Video'
    case 'zip':
      return 'Archive'
    case 'docx':
      return 'Document'
    case 'image':
      return 'Image'
    default:
      return 'File'
  }
}

/** Upper-cased extension for the file tile, e.g. "PY" or "PDF". */
export function getExtension(material: Pick<Material, 'file_name' | 'file_type' | 'video_url'>): string {
  if (material.video_url) return 'VID'
  const ext = material.file_name?.split('.').pop()
  if (ext && ext.length <= 4) return ext.toUpperCase()
  return getFileKindLabel(getFileKind(material)).slice(0, 3).toUpperCase()
}

export function getFileTypeFromName(fileName: string): Exclude<FileKind, 'video' | 'file'> {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  if (extension === 'pdf') return 'pdf'
  if (['c', 'py', 'java', 'js', 'ts'].includes(extension)) return 'code'
  if (['png', 'jpg', 'jpeg'].includes(extension)) return 'image'
  if (['zip', 'rar'].includes(extension)) return 'zip'
  return 'docx'
}

export function parseTags(input: string): string[] | null {
  const tags = input
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
  return tags.length ? Array.from(new Set(tags)) : null
}

export function displayName(profile: { display_name?: string | null; username?: string } | null | undefined) {
  return profile?.display_name || profile?.username || 'Classmate'
}

export function initials(name: string) {
  return name
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

/** "Lab 6 — Pointers & Dynamic Memory" becomes "Lab 6" for tight spaces. */
export function shortLabName(name: string): string {
  const short = name.split(/\s+[—–-]\s+|:\s+/)[0]?.trim()
  return short || name
}

/** Short labels for a set of labs, keeping full names where short ones would collide. */
export function labChipOptions(labs: { id: string; name: string }[]) {
  const counts = new Map<string, number>()
  for (const lab of labs) counts.set(shortLabName(lab.name), (counts.get(shortLabName(lab.name)) || 0) + 1)
  return labs.map((lab) => {
    const short = shortLabName(lab.name)
    return { value: lab.id, label: counts.get(short)! > 1 ? lab.name : short, title: lab.name }
  })
}
