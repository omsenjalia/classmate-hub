import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import {
  Announcement,
  Material,
  EventItem,
  Poll,
  Deadline,
  Subject,
  Lab,
} from '@/lib/types'

type OrderDef = { column: string; ascending?: boolean }

/**
 * Generic read helper for Supabase tables. Returns an empty array whenever
 * credentials are missing or the query fails — callers treat that as
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

export const fetchLiveAnnouncements = () =>
  fetchTable<Announcement>('announcements', '*, profiles(*)', [
    { column: 'is_pinned' },
    { column: 'created_at' },
  ])

export const fetchLiveMaterials = () =>
  fetchTable<Material>('materials', '*, profiles(*), subjects(*), labs(*)', [
    { column: 'created_at' },
  ])

export const fetchLiveEvents = () =>
  fetchTable<EventItem>('events', '*, profiles(*), subjects(*)', [
    { column: 'start_time', ascending: true },
  ])

export const fetchLivePolls = () =>
  fetchTable<Poll>('polls', '*, profiles(*)', [{ column: 'created_at' }])

export const fetchLiveDeadlines = () =>
  fetchTable<Deadline>('deadlines', '*, subjects(*)', [
    { column: 'due_date', ascending: true },
  ])

export const fetchLiveSubjects = () =>
  fetchTable<Subject>('subjects', '*', [{ column: 'sort_order', ascending: true }])

export const fetchLiveLabs = () =>
  fetchTable<Lab>('labs', '*', [{ column: 'sort_order', ascending: true }])
