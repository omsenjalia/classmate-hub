import { createClient } from '@/lib/supabase/client'
import {
  Announcement,
  Material,
  EventItem,
  Poll,
  Deadline,
  Subject,
  Channel,
  Lab,
} from '@/lib/types'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY

  return !!url && !!key && !url.includes('placeholder')
}

export async function fetchLiveAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles(*)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as Announcement[]
  } catch {
    return []
  }
}

export async function fetchLiveMaterials(): Promise<Material[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('materials')
      .select('*, profiles(*), subjects(*), labs(*)')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as Material[]
  } catch {
    return []
  }
}

export async function fetchLiveEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(*), subjects(*)')
      .order('start_time', { ascending: true })

    if (error || !data) return []
    return data as EventItem[]
  } catch {
    return []
  }
}

export async function fetchLivePolls(): Promise<Poll[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('polls')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as Poll[]
  } catch {
    return []
  }
}

export async function fetchLiveDeadlines(): Promise<Deadline[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deadlines')
      .select('*, subjects(*)')
      .order('due_date', { ascending: true })

    if (error || !data) return []
    return data as Deadline[]
  } catch {
    return []
  }
}

export async function fetchLiveSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error || !data) return []
    return data as Subject[]
  } catch {
    return []
  }
}

export async function fetchLiveChannels(): Promise<Channel[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: true })

    if (error || !data) return []
    return data as Channel[]
  } catch {
    return []
  }
}

export async function fetchLiveLabs(): Promise<Lab[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error || !data) return []
    return data as Lab[]
  } catch {
    return []
  }
}
