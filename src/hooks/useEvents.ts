'use client'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { fetchLiveEvents } from '@/lib/supabase-data'
import { EventItem } from '@/lib/types'
import { useAsyncData } from '@/hooks/useAsyncData'

export type RsvpStatus = 'going' | 'maybe' | 'not_going'

interface EventRsvpRow {
  event_id: string
  user_id: string
  status: RsvpStatus
}

interface CreateEventInput {
  title: string
  description: string | null
  type: EventItem['type']
  location: string | null
  start_time: string
  max_attendees: number | null
  subject_id: string | null
}

/**
 * Loads events plus their RSVPs and derives per-event tallies and the
 * current user's status (the events table stores no count columns).
 */
function applyRsvps(
  events: EventItem[],
  rsvps: EventRsvpRow[],
  userId?: string
): EventItem[] {
  return events.map((evt) => {
    const rows = rsvps.filter((r) => r.event_id === evt.id)
    const own = userId ? rows.find((r) => r.user_id === userId) : undefined
    return {
      ...evt,
      going_count: rows.filter((r) => r.status === 'going').length,
      maybe_count: rows.filter((r) => r.status === 'maybe').length,
      user_rsvp_status: own?.status ?? null,
    }
  })
}

async function fetchAllRsvps(): Promise<EventRsvpRow[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const { data, error } = await createClient()
      .from('event_rsvps')
      .select('event_id, user_id, status')
    return error || !data ? [] : (data as EventRsvpRow[])
  } catch {
    return []
  }
}

export function useEvents(userId?: string) {
  const { data, setData, isLoading, error } = useAsyncData<EventItem[]>(async () => {
    const [events, rsvps] = await Promise.all([fetchLiveEvents(), fetchAllRsvps()])
    return applyRsvps(events, rsvps, userId)
  }, [userId])

  const events = data ?? []

  const createEvent = async (
    input: CreateEventInput,
    createdBy: string
  ): Promise<EventItem | null> => {
    const { data: created, error } = await createClient()
      .from('events')
      .insert({ ...input, created_by: createdBy })
      .select('*, profiles(*)')
      .single()

    if (error || !created) return null
    const withRsvps = applyRsvps([created as EventItem], [], createdBy)[0]
    setData((current) => [withRsvps, ...(current ?? [])])
    return withRsvps
  }

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    const { error } = await createClient().from('events').delete().eq('id', eventId)
    if (error) return false
    setData((current) => (current ?? []).filter((evt) => evt.id !== eventId))
    return true
  }

  /**
   * Optimistically updates the RSVP tallies, then persists an upsert into
   * event_rsvps (one row per event+user); rolls back on failure.
   */
  const setRsvp = async (
    eventId: string,
    status: RsvpStatus,
    userId: string
  ): Promise<boolean> => {
    let snapshot: EventItem[] | null = null

    setData((current) => {
      snapshot = current ?? []
      return snapshot.map((evt) => {
        if (evt.id !== eventId) return evt
        const oldStatus = evt.user_rsvp_status
        const goingDelta =
          (status === 'going' ? 1 : 0) - (oldStatus === 'going' ? 1 : 0)
        const maybeDelta =
          (status === 'maybe' ? 1 : 0) - (oldStatus === 'maybe' ? 1 : 0)

        return {
          ...evt,
          user_rsvp_status: status,
          going_count: Math.max(0, (evt.going_count || 0) + goingDelta),
          maybe_count: Math.max(0, (evt.maybe_count || 0) + maybeDelta),
        }
      })
    })

    const { error } = await createClient()
      .from('event_rsvps')
      .upsert(
        { event_id: eventId, user_id: userId, status },
        { onConflict: 'event_id,user_id' }
      )

    if (error) {
      if (snapshot) setData(snapshot)
      return false
    }
    return true
  }

  return { events, isLoading, error, createEvent, deleteEvent, setRsvp }
}
