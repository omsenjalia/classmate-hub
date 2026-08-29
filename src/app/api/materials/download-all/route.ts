import { NextResponse } from 'next/server'
import { zipSync } from 'fflate'
import { createClient } from '@/lib/supabase/server'
import { downloadFileFromGithub } from '@/lib/github-storage'
import type { Material } from '@/lib/types'

function safeFileName(name: string, fallback: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '')
  return cleaned || fallback
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { materialIds?: unknown }
    const materialIds = Array.isArray(body.materialIds)
      ? body.materialIds.filter((id): id is string => typeof id === 'string' && id.length <= 100)
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

    const materials = (data || []) as Pick<Material, 'id' | 'title' | 'file_key' | 'file_name' | 'is_hidden'>[]
    const files: Record<string, Uint8Array> = {}
    const usedNames = new Set<string>()

    for (const material of materials) {
      if (material.is_hidden || !material.file_key) continue
      const originalName = safeFileName(material.file_name || material.title, `${material.id}.bin`)
      let fileName = originalName
      let suffix = 2
      while (usedNames.has(fileName)) {
        const dot = originalName.lastIndexOf('.')
        fileName = dot > 0 ? `${originalName.slice(0, dot)}-${suffix}${originalName.slice(dot)}` : `${originalName}-${suffix}`
        suffix += 1
      }
      usedNames.add(fileName)
      files[fileName] = new Uint8Array(await downloadFileFromGithub(material.file_key))
    }

    if (Object.keys(files).length === 0) {
      return NextResponse.json({ error: 'No downloadable materials found' }, { status: 404 })
    }

    const archive = zipSync(files, { level: 6 })
    return new NextResponse(archive, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': archive.length.toString(),
        'Content-Disposition': 'attachment; filename="classmate-materials.zip"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Download failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

