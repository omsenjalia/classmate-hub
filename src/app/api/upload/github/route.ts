import { NextResponse } from 'next/server'
import { uploadGithubChunk } from '@/lib/github-storage'
import { createClient } from '@/lib/supabase/server'
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import { GITHUB_UPLOAD_CHUNK_SIZE } from '@/lib/github-upload'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const uploadId = formData.get('uploadId')
    const fileName = formData.get('fileName')
    const fileSize = Number(formData.get('fileSize'))
    const contentType = formData.get('contentType')
    const chunkIndex = Number(formData.get('chunkIndex'))
    const totalChunks = Number(formData.get('totalChunks'))

    if (!(file instanceof File) || typeof uploadId !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(uploadId)) {
      return NextResponse.json({ error: 'Invalid upload request' }, { status: 400 })
    }
    if (typeof fileName !== 'string' || !Number.isSafeInteger(fileSize) || fileSize < 1 || fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Invalid file metadata' }, { status: 400 })
    }
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (!extension || !ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ error: 'This file type is not allowed' }, { status: 400 })
    }
    if (!Number.isInteger(chunkIndex) || !Number.isInteger(totalChunks) || chunkIndex < 0 || totalChunks < 1 || chunkIndex >= totalChunks) {
      return NextResponse.json({ error: 'Invalid chunk metadata' }, { status: 400 })
    }
    const expectedTotalChunks = Math.ceil(fileSize / GITHUB_UPLOAD_CHUNK_SIZE)
    const expectedChunkSize = chunkIndex === totalChunks - 1
      ? fileSize - chunkIndex * GITHUB_UPLOAD_CHUNK_SIZE
      : GITHUB_UPLOAD_CHUNK_SIZE
    if (totalChunks !== expectedTotalChunks || file.size !== expectedChunkSize) {
      return NextResponse.json({ error: 'Invalid chunk size' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'You must be signed in to upload files' }, { status: 401 })

    const result = await uploadGithubChunk({
      userId: user.id,
      uploadId,
      fileName,
      fileSize,
      contentType: typeof contentType === 'string' ? contentType : 'application/octet-stream',
      chunkIndex,
      totalChunks,
      chunk: Buffer.from(await file.arrayBuffer()),
    })
    return NextResponse.json(result ? { ...result, completed: true } : { completed: false })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'GitHub upload failed'
    const status = message.includes('not configured') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
