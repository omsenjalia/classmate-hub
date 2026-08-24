'use client'

import { MaterialVersion } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function VersionHistory({ versions }: { versions: MaterialVersion[] }) {
  if (versions.length === 0) return null

  return (
    <section className="bg-card border border-border rounded-2xl p-5">
      <h2 className="text-sm font-bold text-primary">Version history</h2>
      <div className="mt-3 space-y-2">
        {versions.map((version) => (
          <a
            key={version.id}
            href={version.file_url || '#'}
            target="_blank"
            rel="noreferrer"
            className="flex justify-between text-sm rounded-lg bg-page p-3 hover:text-indigo-500"
          >
            <span>Version {version.version_number} · {version.file_name}</span>
            <span className="text-muted">{formatDate(version.created_at)}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
