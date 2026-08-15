import { NextResponse } from 'next/server'
import { deleteFileFromGithub } from '@/lib/github-storage'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const resolvedParams = await params
    const fullKey = resolvedParams.key.join('/')

    if (!fullKey) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 })
    }

    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Verify ownership or admin
        const { data: material } = await supabase
          .from('materials')
          .select('uploaded_by')
          .eq('file_key', fullKey)
          .single()

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const isAdmin = profile?.role === 'admin'
        const isOwner = material?.uploaded_by === user.id

        if (!isOwner && !isAdmin) {
          return NextResponse.json({ error: 'Forbidden: Only owner or admin can delete' }, { status: 403 })
        }

        // Delete DB record
        await supabase.from('materials').delete().eq('file_key', fullKey)
      }
    } catch {
      // Fallback
    }

    // Delete from Private GitHub Repository
    try {
      await deleteFileFromGithub(fullKey)
    } catch {
      // Ignore network errors
    }

    return NextResponse.json({ success: true, key: fullKey })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
