import { createClient } from '@/lib/supabase/client'
import type { Material } from '@/lib/types'

/**
 * Deletes through the server route when a stored file exists (it removes
 * both object and metadata), otherwise straight from Supabase.
 */
export async function deleteMaterial(material: Pick<Material, 'id' | 'file_key'>): Promise<void> {
  if (material.file_key) {
    const response = await fetch(`/api/upload/${material.file_key}`, { method: 'DELETE' })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to delete the stored file')
    }
    return
  }
  const { error } = await createClient().from('materials').delete().eq('id', material.id)
  if (error) throw new Error(error.message)
}

/** Writes sort_order = index for every row whose position changed. */
export async function persistOrder(table: 'materials' | 'subjects' | 'labs', rows: { id: string; sort_order: number }[]) {
  const supabase = createClient()
  const changed = rows
    .map((row, index) => ({ ...row, next: index + 1 }))
    .filter((row) => row.sort_order !== row.next)
  const results = await Promise.all(
    changed.map((row) => supabase.from(table).update({ sort_order: row.next }).eq('id', row.id))
  )
  const failed = results.find((result) => result.error)
  if (failed?.error) throw new Error(failed.error.message)
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
