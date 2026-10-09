import Link from 'next/link'
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr'
import FileTile from '@/components/materials/FileTile'
import { cn, formatBytes, formatShortDate, shortLabName } from '@/lib/utils'
import type { Material } from '@/lib/types'

interface MaterialListProps {
  materials: Material[]
  /** Hide the subject code when the list is already scoped to one subject. */
  showSubject?: boolean
}

/** Full-width tappable rows, grouped visually by one hairline per row. */
export default function MaterialList({ materials, showSubject = true }: MaterialListProps) {
  return (
    <ul className="-mx-4 sm:mx-0 sm:overflow-hidden sm:rounded-card sm:border sm:border-line sm:bg-surface">
      {materials.map((item, index) => (
        <li
          key={item.id}
          className="group/row animate-rise"
          style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
        >
          <MaterialRow item={item} showSubject={showSubject} />
        </li>
      ))}
    </ul>
  )
}

export function MaterialRow({ item, showSubject = true }: { item: Material; showSubject?: boolean }) {
  type MetaPart = { key: string; text: string; mono?: boolean; shrink?: boolean }
  const parts: (MetaPart | null)[] = [
    showSubject && item.subjects ? { key: 'subject', text: item.subjects.code, mono: true } : null,
    item.labs ? { key: 'lab', text: shortLabName(item.labs.name), shrink: true } : null,
    item.file_size_bytes
      ? { key: 'size', text: formatBytes(item.file_size_bytes) }
      : item.video_url
        ? { key: 'size', text: 'Video' }
        : null,
    { key: 'date', text: formatShortDate(item.created_at) },
  ]
  const meta = parts.filter((part): part is MetaPart => part !== null)

  return (
    <Link
      href={`/materials/${item.id}`}
      className="flex items-center gap-3.5 pl-4 transition-colors hover:bg-surface-2/60 active:bg-surface-2"
    >
      <FileTile material={item} />
      <span className="flex min-w-0 flex-1 items-center gap-2 border-b border-line py-3.5 pr-3 group-last/row:border-b-0">
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[15px] font-medium leading-snug">{item.title}</span>
          <span className="mt-1 flex items-center gap-2 overflow-hidden whitespace-nowrap text-[13px] text-muted">
            {meta.map((part, i) => (
              <span
                key={part.key}
                className={cn(
                  part.shrink ? 'min-w-0 truncate' : 'shrink-0',
                  i > 0 && 'before:mr-2 before:inline-block before:h-2.5 before:w-px before:bg-line-strong before:align-[-1px]',
                  part.mono && 'font-mono text-[12px] font-medium text-ink-2'
                )}
              >
                {part.text}
              </span>
            ))}
          </span>
        </span>
        <CaretRightIcon className="size-4 shrink-0 text-muted" aria-hidden />
      </span>
    </Link>
  )
}

export function MaterialListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading materials" className="space-y-1">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3.5 py-3">
          <div className="skeleton size-12 rounded-tile" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 rounded" style={{ width: `${82 - (i % 3) * 14}%` }} />
            <div className="skeleton h-3 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
