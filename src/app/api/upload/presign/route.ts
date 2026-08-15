import { NextResponse } from 'next/server'
import { createPresignedUploadUrl } from '@/lib/r2'
import { MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fileName, contentType, fileSize } = body

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'fileName and contentType are required' }, { status: 400 })
    }

    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed 100MB cap' }, { status: 400 })
    }

    let userId = 'user-demo-admin-1'
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
      }
    } catch {
      // Fallback for preview mode
    }

    const { presignedUrl, key, publicUrl } = await createPresignedUploadUrl(
      userId,
      fileName,
      contentType
    )

    return NextResponse.json({ presignedUrl, key, publicUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload presign failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
