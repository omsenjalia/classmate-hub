import { NextResponse } from 'next/server'
import { openGithubFileStream } from '@/lib/github-storage'

export const runtime = 'nodejs'
// Large split files stream part by part; give them time to finish.
export const maxDuration = 300

const CONTENT_TYPES: [RegExp, string][] = [
  [/\.pdf$/, 'application/pdf'],
  [/\.png$/, 'image/png'],
  [/\.jpe?g$/, 'image/jpeg'],
  [/\.docx$/, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  [/\.zip$/, 'application/zip'],
  [/\.rar$/, 'application/vnd.rar'],
  [/\.(c|py|java|js|ts)$/, 'text/plain; charset=utf-8'],
]

function contentTypeFor(path: string) {
  const lower = path.toLowerCase()
  return CONTENT_TYPES.find(([pattern]) => pattern.test(lower))?.[1] ?? 'application/octet-stream'
}

/** Strips the "<uuid>-" storage prefix so saved files keep their original name. */
function downloadName(fullPath: string, manifestName: string | null) {
  if (manifestName) return manifestName
  const last = fullPath.split('/').pop() || 'download'
  return last.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, '')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const fullPath = path ? path.join('/') : ''

    if (!fullPath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    const file = await openGithubFileStream(fullPath)
    const contentType = contentTypeFor(fullPath)
    const inline = contentType.startsWith('image') || contentType === 'application/pdf'
    const name = downloadName(fullPath, file.fileName)
    const asciiName = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_')

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
    if (file.size) headers.set('Content-Length', String(file.size))

    return new Response(file.stream, { status: 200, headers })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Download failed'
    return NextResponse.json({ error: message }, { status: 404 })
  }
}
