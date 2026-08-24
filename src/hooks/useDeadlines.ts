'use client'

import { createClient } from '@/lib/supabase/client'
import { fetchLiveDeadlines } from '@/lib/supabase-data'
import { Deadline, DeadlineType } from '@/lib/types'
import { useAsyncData } from '@/hooks/useAsyncData'

export interface DeadlineDraft {
  title: string
  description: string | null
  subject_id: string | null
  due_date: string
  type: DeadlineType
}

export function useDeadlines() {
  const { data, setData, isLoading, error } = useAsyncData<Deadline[]>(
    fetchLiveDeadlines,
    []
  )

  const deadlines = data ?? []

  const createDeadline = async (
    draft: DeadlineDraft,
    createdBy: string
  ): Promise<boolean> => {
    const { data: created, error } = await createClient()
      .from('deadlines')
      .insert({ ...draft, created_by: createdBy })
      .select('*, subjects(*)')
      .single()

    if (error || !created) return false
    setData((current) => [created as Deadline, ...(current ?? [])])
    return true
  }

  /** Admin-only per RLS ("Admin delete deadline"). */
  const deleteDeadline = async (deadlineId: string): Promise<boolean> => {
    const { error } = await createClient().from('deadlines').delete().eq('id', deadlineId)
    if (error) return false
    setData((current) => (current ?? []).filter((d) => d.id !== deadlineId))
    return true
  }

  return { deadlines, isLoading, error, createDeadline, deleteDeadline }
}
