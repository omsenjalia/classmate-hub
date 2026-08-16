'use client'

import { useEffect } from 'react'
import { fetchLiveChannels, fetchLiveSubjects } from '@/lib/supabase-data'
import { useAppStore } from '@/store/useAppStore'

/** Loads shared navigation data once for every page in the authenticated shell. */
export default function AppDataProvider({ children }: { children: React.ReactNode }) {
  const setSubjects = useAppStore((state) => state.setSubjects)
  const setChannels = useAppStore((state) => state.setChannels)

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchLiveSubjects(), fetchLiveChannels()]).then(([subjects, channels]) => {
      if (!cancelled) {
        setSubjects(subjects)
        setChannels(channels)
      }
    })

    return () => {
      cancelled = true
    }
  }, [setChannels, setSubjects])

  return children
}
