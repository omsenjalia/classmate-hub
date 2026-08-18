'use client'

import { useEffect } from 'react'
import { fetchLiveSubjects } from '@/lib/supabase-data'
import { useAppStore } from '@/store/useAppStore'

/** Loads shared navigation data once for every page in the authenticated shell. */
export default function AppDataProvider({ children }: { children: React.ReactNode }) {
  const setSubjects = useAppStore((state) => state.setSubjects)

  useEffect(() => {
    let cancelled = false

    fetchLiveSubjects().then((subjects) => {
      if (!cancelled) {
        setSubjects(subjects)
      }
    })

    return () => {
      cancelled = true
    }
  }, [setSubjects])

  return children
}
