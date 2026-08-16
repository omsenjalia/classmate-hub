import { NextResponse } from 'next/server'
import { deleteFileFromGithub } from '@/lib/github-storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params
    const fullKey = key.join('/')
    if (!fullKey) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to delete a file' }, { status: 401 })
    }

    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('id, uploaded_by, file_url')
      .eq('file_key', fullKey)
      .maybeSingle()

    if (materialError) throw new Error(materialError.message)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const isAdmin = profile?.role === 'admin'
    const ownsMaterial = material?.uploaded_by === user.id
    // A just-uploaded object has no material row yet, but its user-id prefix
    // still makes cleanup safe if saving the metadata fails.
    const ownsUnattachedObject = fullKey.startsWith(`${user.id}/`)

    if (!isAdmin && !ownsMaterial && !ownsUnattachedObject) {
      return NextResponse.json({ error: 'Only the owner or an admin can delete this file' }, { status: 403 })
    }

    await deleteFileFromGithub(fullKey)

    if (material) {
      const { error: deleteError } = await supabase.from('materials').delete().eq('id', material.id)
      if (deleteError) throw new Error(deleteError.message)
    }

    return NextResponse.json({ success: true, key: fullKey })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
