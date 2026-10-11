import { NextResponse } from 'next/server'
import { Zip, ZipPassThrough } from 'fflate'
import { createClient } from '@/lib/supabase/server'
import { openGithubFileStream } from '@/lib/github-storage'
import type { Material } from '@/lib/types'

export const runtime = 'nodejs'
// The archive streams file by file; large selections need time to finish.
export const maxDuration = 300

type ZipSource = Pick<Material, 'id' | 'title' | 'file_key' | 'file_name' | 'is_hidden'>

function safeFileName(name: string, fallback: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '')
  return cleaned || fallback
}

function uniqueNames(materials: ZipSource[]) {
  const used = new Set<string>()
  return materials.map((material) => {
    const original = safeFileName(material.file_name || material.title, `${material.id}.bin`)
    let name = original
    let suffix = 2
    while (used.has(name)) {
      const dot = original.lastIndexOf('.')
      name = dot > 0 ? `${original.slice(0, dot)}-${suffix}${original.slice(dot)}` : `${original}-${suffix}`
      suffix += 1
    }
    used.add(name)
    return { key: material.file_key!, name }
  })
}

/**
 * Builds the ZIP while it downloads: each stored file is read part by part
 * and written straight into the archive, so selection size isn't bounded by
 * function memory. Entries are stored uncompressed; PDFs, images and
 * archives don't shrink anyway and this keeps the CPU cost near zero.
 */
function streamZip(entries: { key: string; name: string }[]) {
  // Resolved by pull() when the client has read enough to want more.
  let wake: (() => void) | null = null
  const drained = (controller: ReadableStreamDefaultController<Uint8Array>) =>
    (controller.desiredSize ?? 1) > 0 ? Promise.resolve() : new Promise<void>((resolve) => (wake = resolve))

  return new ReadableStream<Uint8Array>(
    {
      start(controller) {
        const zip = new Zip((error, chunk, final) => {
          if (error) return controller.error(error)
          controller.enqueue(chunk)
          if (final) controller.close()
        })
        // Not awaited: pull() only runs once start() has returned.
        void (async () => {
          try {
            for (const entry of entries) {
              const file = new ZipPassThrough(entry.name)
              zip.add(file)
              const reader = (await openGithubFileStream(entry.key)).stream.getReader()
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                file.push(value)
                await drained(controller)
              }
              file.push(new Uint8Array(0), true)
            }
            zip.end()
          } catch (error) {
            zip.terminate()
            controller.error(error)
          }
        })()
      },
      pull() {
        wake?.()
        wake = null
      },
    },
    new ByteLengthQueuingStrategy({ highWaterMark: 8 * 1024 * 1024 })
  )
}

export async function POST(request: Request) {
  try {
    // JSON from fetch(), or a plain form post for archives too big to buffer in the browser.
    const raw = request.headers.get('content-type')?.includes('application/json')
      ? ((await request.json()) as { materialIds?: unknown }).materialIds
      : (await request.formData()).getAll('materialIds')
    const materialIds = Array.isArray(raw)
      ? raw.filter((id): id is string => typeof id === 'string' && id.length <= 100)
      : []

    if (materialIds.length === 0 || materialIds.length > 100) {
      return NextResponse.json({ error: 'Select between 1 and 100 materials' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('materials')
      .select('id, title, file_key, file_name, is_hidden')
      .in('id', materialIds)

    if (error) throw error

    const downloadable = ((data || []) as ZipSource[]).filter((material) => !material.is_hidden && material.file_key)
    if (downloadable.length === 0) {
      return NextResponse.json({ error: 'No downloadable materials found' }, { status: 404 })
    }

    const requestedName = new URL(request.url).searchParams.get('name') || 'classmate-materials.zip'
    const zipName = safeFileName(requestedName, 'classmate-materials.zip')

    return new Response(streamZip(uniqueNames(downloadable)), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Download failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
