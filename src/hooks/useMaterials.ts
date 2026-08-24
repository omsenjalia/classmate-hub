'use client'

import { fetchLiveLabs, fetchLiveMaterials } from '@/lib/supabase-data'
import { Lab, Material } from '@/lib/types'
import { useAsyncData } from '@/hooks/useAsyncData'

/** Loads the materials catalog plus labs for the subject-linked filter. */
export function useMaterials() {
  const { data, isLoading, error } = useAsyncData(async () => {
    const [materials, labs] = await Promise.all([fetchLiveMaterials(), fetchLiveLabs()])
    return { materials, labs }
  }, [])

  return {
    materials: data?.materials ?? ([] as Material[]),
    labs: data?.labs ?? ([] as Lab[]),
    isLoading,
    error,
  }
}
