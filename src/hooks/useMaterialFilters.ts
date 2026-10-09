'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getFileKind } from '@/lib/utils'
import type { Material } from '@/lib/types'

export type SortKey = 'newest' | 'popular' | 'curated'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most downloaded' },
  { value: 'curated', label: 'Class order' },
]

export interface MaterialFilters {
  q: string
  subject: string
  lab: string
  type: string
  sort: SortKey
}

const DEFAULTS: MaterialFilters = { q: '', subject: '', lab: '', type: '', sort: 'newest' }

function readFilters(params: URLSearchParams): MaterialFilters {
  const sort = params.get('sort')
  return {
    q: params.get('q') ?? params.get('search') ?? '',
    subject: params.get('subject') ?? '',
    lab: params.get('lab') ?? '',
    type: params.get('type') ?? '',
    sort: sort === 'popular' || sort === 'curated' ? sort : 'newest',
  }
}

export function matchesQuery(item: Material, query: string) {
  const q = query.toLowerCase().trim()
  if (!q) return true
  return (
    item.title.toLowerCase().includes(q) ||
    !!item.description?.toLowerCase().includes(q) ||
    !!item.subjects?.code.toLowerCase().includes(q) ||
    !!item.subjects?.name.toLowerCase().includes(q) ||
    !!item.labs?.name.toLowerCase().includes(q) ||
    !!item.tags?.some((tag) => tag.toLowerCase().includes(q))
  )
}

export function sortMaterials(items: Material[], sort: SortKey) {
  return [...items].sort((a, b) => {
    if (sort === 'popular') return b.download_count - a.download_count
    if (sort === 'curated') return a.sort_order - b.sort_order
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

/**
 * Library filter state, mirrored into the URL so a filtered view can be
 * shared or restored with the back button.
 */
export function useMaterialFilters(materials: Material[]) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [filters, setFilters] = useState<MaterialFilters>(() => readFilters(searchParams))

  useEffect(() => {
    const params = new URLSearchParams()
    for (const key of Object.keys(DEFAULTS) as (keyof MaterialFilters)[]) {
      const value = filters[key].trim()
      if (value && value !== DEFAULTS[key]) params.set(key, value)
    }
    const next = params.toString()
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
    // Only push local state outward; reading back happens on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const update = (patch: Partial<MaterialFilters>) => setFilters((current) => ({ ...current, ...patch }))
  const reset = () => setFilters((current) => ({ ...DEFAULTS, sort: current.sort }))

  const results = useMemo(() => {
    const visible = materials.filter((item) => {
      if (item.is_hidden) return false
      if (filters.subject && item.subject_id !== filters.subject) return false
      if (filters.lab === 'lecture' && item.lab_id) return false
      if (filters.lab && filters.lab !== 'lecture' && item.lab_id !== filters.lab) return false
      if (filters.type && getFileKind(item) !== filters.type) return false
      return matchesQuery(item, filters.q)
    })
    return sortMaterials(visible, filters.sort)
  }, [materials, filters])

  /** Count of refinements beyond search and subject chips, for the filter badge. */
  const sheetFilterCount = (filters.type ? 1 : 0) + (filters.lab ? 1 : 0)
  const isFiltered = Boolean(filters.q || filters.subject || filters.lab || filters.type)

  return { filters, update, reset, results, sheetFilterCount, isFiltered }
}
