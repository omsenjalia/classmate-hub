'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchLiveLabs } from '@/lib/supabase-data'
import { Lab, Material, MaterialVersion } from '@/lib/types'
import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_EXTENSIONS } from '@/lib/constants'
import { uploadFileInGithubChunks } from '@/lib/github-upload'
import { useAppStore } from '@/store/useAppStore'

export interface MaterialDraft {
  title: string
  description: string | null
  subject_id: string | null
  lab_id: string | null
  tags: string[] | null
}

export function useMaterialDetail(materialId: string) {
  const user = useAppStore((state) => state.user)

  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadCount, setDownloadCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [versions, setVersions] = useState<MaterialVersion[]>([])
  const [labs, setLabs] = useState<Lab[]>([])

  useEffect(() => {
    let cancelled = false

    async function fetchMaterial() {
      setLoading(true)
      try {
        const { data, error } = await createClient()
          .from('materials')
          .select('*, profiles(*), subjects(*), labs(*)')
          .eq('id', materialId)
          .single()

        if (cancelled) return

        if (error || !data) {
          setMaterial(null)
        } else {
          setMaterial(data as Material)
          setDownloadCount(data.download_count || 0)
        }
      } catch {
        if (!cancelled) setMaterial(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchMaterial()
    return () => {
      cancelled = true
    }
  }, [materialId])

  useEffect(() => {
    let cancelled = false
    if (!user) return
    createClient()
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('material_id', materialId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setBookmarked(Boolean(data))
      })
    return () => {
      cancelled = true
    }
  }, [materialId, user])

  useEffect(() => {
    let cancelled = false
    createClient()
      .from('material_versions')
      .select('*')
      .eq('material_id', materialId)
      .order('version_number', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setVersions((data || []) as MaterialVersion[])
      })
    return () => {
      cancelled = true
    }
  }, [materialId])

  useEffect(() => {
    let cancelled = false
    fetchLiveLabs().then((rows) => {
      if (!cancelled) setLabs(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const isOwner = user?.id === material?.uploaded_by
  const isAdmin = user?.role === 'admin'
  const canManage = isOwner || isAdmin

  const availableLabs = useMemo(
    () => labs.filter((lab) => lab.subject_id === material?.subject_id),
    [labs, material?.subject_id]
  )

  /** Fire-and-forget counter bump plus navigation to the stored file. */
  const registerDownload = () => {
    setDownloadCount((prev) => prev + 1)
    createClient()
      .from('materials')
      .update({ download_count: downloadCount + 1 })
      .eq('id', materialId)
      .then(() => {})
  }

  const toggleBookmark = async (): Promise<boolean> => {
    if (!user) return false
    const supabase = createClient()
    const { error } = bookmarked
      ? await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('material_id', materialId)
      : await supabase.from('bookmarks').insert({ user_id: user.id, material_id: materialId })
    if (error) return false
    setBookmarked((value) => !value)
    return true
  }

  /**
   * Deletes through the server route when a stored file exists (it removes
   * both object and metadata), otherwise straight from Supabase.
   */
  const remove = async (): Promise<boolean> => {
    try {
      if (material?.file_key) {
        const response = await fetch(`/api/upload/${material.file_key}`, { method: 'DELETE' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to delete the stored file')
        }
      } else {
        const { error } = await createClient().from('materials').delete().eq('id', materialId)
        if (error) throw new Error(error.message)
      }
      return true
    } catch {
      return false
    }
  }

  const saveMetadata = async (draft: MaterialDraft): Promise<boolean> => {
    const { data, error } = await createClient()
      .from('materials')
      .update(draft)
      .eq('id', materialId)
      .select('*, profiles(*), subjects(*), labs(*)')
      .single()

    if (error || !data) return false
    setMaterial(data as Material)
    return true
  }

  const publishNewVersion = async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<boolean> => {
    if (!material || !user || !canManage) return false
    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('File must be 100MB or smaller')
    if (
      !ALLOWED_FILE_EXTENSIONS.some((extension) =>
        file.name.toLowerCase().endsWith(`.${extension}`)
      )
    ) {
      throw new Error('This file type is not supported')
    }

    let uploadedKey: string | null = null
    try {
      const upload = await uploadFileInGithubChunks(file, onProgress)
      uploadedKey = upload.key
      const supabase = createClient()
      const nextNumber = (versions[0]?.version_number || 0) + 1
      const note = `Replaced with ${file.name}`

      const { error: versionError } = await supabase.from('material_versions').insert({
        material_id: material.id,
        version_number: nextNumber,
        file_url: material.file_url,
        file_key: material.file_key,
        file_name: material.file_name,
        file_size_bytes: material.file_size_bytes,
        change_note: note,
        created_by: user.id,
      })
      if (versionError) throw new Error(versionError.message)

      const { data, error } = await supabase
        .from('materials')
        .update({
          file_url: upload.publicUrl,
          file_key: upload.key,
          file_name: file.name,
          file_size_bytes: file.size,
          file_type: material.file_type,
        })
        .eq('id', material.id)
        .select('*, profiles(*), subjects(*), labs(*)')
        .single()
      if (error || !data) throw new Error(error?.message || 'Could not update material file')

      setMaterial(data as Material)
      setVersions((current) => [
        {
          id: `local-${nextNumber}`,
          material_id: material.id,
          version_number: nextNumber,
          file_url: material.file_url,
          file_key: material.file_key,
          file_name: material.file_name,
          file_size_bytes: material.file_size_bytes,
          change_note: note,
          created_by: user.id,
          created_at: new Date().toISOString(),
        },
        ...current,
      ])
      return true
    } catch (error) {
      // Roll back any orphaned upload so storage doesn't accumulate junk.
      if (uploadedKey) {
        await fetch(`/api/upload/${uploadedKey}`, { method: 'DELETE' }).catch(() => undefined)
      }
      throw error instanceof Error ? error : new Error('Could not publish new version')
    }
  }

  return {
    material,
    loading,
    user,
    downloadCount,
    bookmarked,
    versions,
    availableLabs,
    canManage,
    registerDownload,
    toggleBookmark,
    remove,
    saveMetadata,
    publishNewVersion,
  }
}
