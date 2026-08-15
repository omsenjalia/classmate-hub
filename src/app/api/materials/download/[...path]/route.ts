import { NextResponse } from 'next/server'
import { downloadFileFromGithub } from '@/lib/github-storage'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const fullPath = resolvedParams.path ? resolvedParams.path.join('/') : ''

    if (!fullPath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    const fileBuffer = await downloadFileFromGithub(fullPath)
    const uint8Array = new Uint8Array(fileBuffer)

    // Detect Content-Type from filename
    let contentType = 'application/octet-stream'
    const lower = fullPath.toLowerCase()

    if (lower.endsWith('.pdf')) contentType = 'application/pdf'
    else if (lower.endsWith('.png')) contentType = 'image/png'
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg'
    else if (lower.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    else if (lower.endsWith('.zip')) contentType = 'application/zip'
    else if (
      lower.endsWith('.c') ||
      lower.endsWith('.py') ||
      lower.endsWith('.java') ||
      lower.endsWith('.js') ||
      lower.endsWith('.ts')
    ) {
      contentType = 'text/plain'
    }

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': uint8Array.length.toString(),
        'Content-Disposition':
          contentType.startsWith('image') || contentType === 'application/pdf'
            ? 'inline'
            : 'attachment',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Download failed'
    return NextResponse.json({ error: message }, { status: 404 })
  }
}
