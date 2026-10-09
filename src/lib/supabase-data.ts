import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { Material, Subject, Lab } from '@/lib/types'

type OrderDef = { column: string; ascending?: boolean }

export const MATERIAL_SELECT = '*, profiles(*), subjects(*), labs(*)'

/**
 * Generic read helper for Supabase tables. Returns an empty array whenever
 * credentials are missing or the query fails; callers treat that as
 * "nothing to show" rather than an application error.
 */
async function fetchTable<T>(
  table: string,
  select: string,
  order: OrderDef[] = []
): Promise<T[]> {
  if (!isSupabaseConfigured()) return []

  try {
    let query = createClient().from(table).select(select)
    for (const { column, ascending = false } of order) {
      query = query.order(column, { ascending })
    }
    const { data, error } = await query
    if (error || !data) return []
    return data as T[]
  } catch {
    return []
  }
}

export const fetchLiveMaterials = () =>
  fetchTable<Material>('materials', MATERIAL_SELECT, [{ column: 'created_at' }])

export const fetchLiveSubjects = () =>
  fetchTable<Subject>('subjects', '*', [{ column: 'sort_order', ascending: true }])

export const fetchLiveLabs = () =>
  fetchTable<Lab>('labs', '*', [{ column: 'sort_order', ascending: true }])

/** Materials the user bookmarked, newest bookmark first. */
export async function fetchBookmarkedMaterials(userId: string): Promise<Material[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await createClient()
    .from('bookmarks')
    .select(`created_at, materials(${MATERIAL_SELECT})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as unknown as { materials: Material | null }[]).flatMap((row) =>
    row.materials && !row.materials.is_hidden ? [row.materials] : []
  )
}
