'use client'

import { useEffect, useState } from 'react'
import { ArrowSquareOutIcon, FilePdfIcon } from '@phosphor-icons/react/dist/ssr'
import { getFileKind } from '@/lib/utils'
import type { Material } from '@/lib/types'

const MAX_CODE_PREVIEW_BYTES = 256 * 1024

export function getVideoEmbedUrl(url: string): string | null {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  if (youtube?.[1]) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`
  const drive = url.match(/drive\.google\.com\/.*\/d\/([a-zA-Z0-9_-]+)/)
  if (drive?.[1]) return `https://drive.google.com/file/d/${drive[1]}/preview`
  return null
}

function CodePreview({ material }: { material: Material }) {
  const [state, setState] = useState<{ text: string | null; failed: boolean }>({ text: null, failed: false })

  useEffect(() => {
    if (!material.file_url) return
    let cancelled = false
    fetch(material.file_url)
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error('fetch failed'))))
      .then((text) => !cancelled && setState({ text, failed: false }))
      .catch(() => !cancelled && setState({ text: null, failed: true }))
    return () => {
      cancelled = true
    }
  }, [material.file_url])

  if (state.failed) return null
  if (state.text === null) return <div className="skeleton h-48 rounded-card" aria-label="Loading code preview" />

  const lines = state.text.replace(/\n$/, '').split('\n')
  return (
    <figure className="overflow-hidden rounded-card border border-line bg-surface">
      <figcaption className="border-b border-line px-4 py-2.5 font-mono text-xs text-muted">
        {material.file_name}
        <span className="float-right">{lines.length} lines</span>
      </figcaption>
      <pre className="max-h-[60dvh] overflow-auto py-3 font-mono text-[12.5px] leading-relaxed">
        <code className="table min-w-full">
          {lines.map((line, index) => (
            <span key={index} className="table-row">
              <span className="table-cell select-none pl-4 pr-4 text-right text-muted/70">{index + 1}</span>
              <span className="table-cell whitespace-pre pr-4">{line || ' '}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}

/** Inline preview where phones can actually render it; otherwise nothing. */
export default function MaterialPreview({ material }: { material: Material }) {
  const kind = getFileKind(material)

  if (material.video_url) {
    const embed = getVideoEmbedUrl(material.video_url)
    if (!embed) return null
    return (
      <div className="-mx-4 aspect-video overflow-hidden bg-black sm:mx-0 sm:rounded-card">
        <iframe
          src={embed}
          title={material.title}
          className="size-full border-0"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  if (!material.file_url) return null

  if (kind === 'image') {
    return (
      <a href={material.file_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-card border border-line bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={material.file_url} alt={material.title} className="mx-auto max-h-[70dvh] w-auto object-contain" />
      </a>
    )
  }

  if (kind === 'code') {
    if ((material.file_size_bytes || 0) > MAX_CODE_PREVIEW_BYTES) return null
    return <CodePreview material={material} />
  }

  if (kind === 'pdf') {
    return (
      <>
        {/* Mobile browsers render embedded PDFs badly, so phones get a tap-through card. */}
        <a
          href={material.file_url}
          target="_blank"
          rel="noreferrer"
          className="pressable flex items-center gap-4 rounded-card border border-line bg-surface p-4 md:hidden"
        >
          <span className="flex size-12 items-center justify-center rounded-tile bg-accent-soft text-accent-soft-ink">
            <FilePdfIcon className="size-6" weight="duotone" />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-medium">Read in your PDF viewer</span>
            <span className="block text-sm text-muted">Opens full screen with zoom and search</span>
          </span>
          <ArrowSquareOutIcon className="size-5 text-muted" />
        </a>
        <iframe
          src={material.file_url}
          title={material.title}
          className="hidden h-[78vh] w-full rounded-card border border-line bg-surface md:block"
        />
      </>
    )
  }

  return null
}
