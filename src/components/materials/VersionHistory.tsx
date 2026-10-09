import { ClockCounterClockwiseIcon } from '@phosphor-icons/react/dist/ssr'
import { MaterialVersion } from '@/lib/types'
import { formatBytes, formatDate } from '@/lib/utils'

/** Earlier files this material replaced, newest first. */
export default function VersionHistory({ versions }: { versions: MaterialVersion[] }) {
  if (versions.length === 0) return null

  return (
    <section aria-labelledby="versions-heading" className="space-y-3">
      <h2 id="versions-heading" className="flex items-center gap-2 text-sm font-semibold text-ink-2">
        <ClockCounterClockwiseIcon className="size-4" /> Earlier versions
      </h2>
      <ul className="overflow-hidden rounded-card border border-line bg-surface">
        {versions.map((version) => (
          <li key={version.id} className="border-b border-line last:border-0">
            <a
              href={version.file_url || undefined}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-surface-2/60"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{version.file_name || `Version ${version.version_number}`}</span>
                <span className="text-muted">
                  Version {version.version_number}
                  {version.file_size_bytes ? `, ${formatBytes(version.file_size_bytes)}` : ''}
                </span>
              </span>
              <span className="shrink-0 text-muted">{formatDate(version.created_at)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
