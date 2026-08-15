import { createClient } from '@/lib/supabase/client'
import {
  MOCK_ANNOUNCEMENTS,
  MOCK_MATERIALS,
  MOCK_EVENTS,
  MOCK_POLLS,
  MOCK_DEADLINES,
  MOCK_SUBJECTS,
  MOCK_CHANNELS,
} from '@/lib/mock-data'
import {
  Announcement,
  Material,
  EventItem,
  Poll,
  Deadline,
  Subject,
  Channel,
} from '@/lib/types'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('placeholder')
}

export async function fetchLiveAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured()) return MOCK_ANNOUNCEMENTS

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles(*)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) return MOCK_ANNOUNCEMENTS
    return data as Announcement[]
  } catch {
    return MOCK_ANNOUNCEMENTS
  }
}

export async function fetchLiveMaterials(): Promise<Material[]> {
  if (!isSupabaseConfigured()) return MOCK_MATERIALS

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('materials')
      .select('*, profiles(*), subjects(*), labs(*)')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) return MOCK_MATERIALS
    return data as Material[]
  } catch {
    return MOCK_MATERIALS
  }
}

export async function fetchLiveEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured()) return MOCK_EVENTS

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(*), subjects(*)')
      .order('start_time', { ascending: true })

    if (error || !data || data.length === 0) return MOCK_EVENTS
    return data as EventItem[]
  } catch {
    return MOCK_EVENTS
  }
}

export async function fetchLivePolls(): Promise<Poll[]> {
  if (!isSupabaseConfigured()) return MOCK_POLLS

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('polls')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) return MOCK_POLLS
    return data as Poll[]
  } catch {
    return MOCK_POLLS
  }
}

export async function fetchLiveDeadlines(): Promise<Deadline[]> {
  if (!isSupabaseConfigured()) return MOCK_DEADLINES

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deadlines')
      .select('*, subjects(*)')
      .order('due_date', { ascending: true })

    if (error || !data || data.length === 0) return MOCK_DEADLINES
    return data as Deadline[]
  } catch {
    return MOCK_DEADLINES
  }
}

export async function fetchLiveSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured()) return MOCK_SUBJECTS

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) return MOCK_SUBJECTS
    return data as Subject[]
  } catch {
    return MOCK_SUBJECTS
  }
}

export async function fetchLiveChannels(): Promise<Channel[]> {
  if (!isSupabaseConfigured()) return MOCK_CHANNELS

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) return MOCK_CHANNELS
    return data as Channel[]
  } catch {
    return MOCK_CHANNELS
  }
}
