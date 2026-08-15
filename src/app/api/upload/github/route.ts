import { NextResponse } from 'next/server'
import { uploadFileToGithub } from '@/lib/github-storage'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    let userId = 'user-demo-admin-1'
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
      }
    } catch {
      // Fallback preview user
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResult = await uploadFileToGithub(
      userId,
      file.name,
      buffer,
      file.type || 'application/octet-stream'
    )

    return NextResponse.json(uploadResult)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'GitHub Storage upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
