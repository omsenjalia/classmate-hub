'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FolderKanban, Filter as FilterIcon, Inbox, Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useMaterials } from '@/hooks/useMaterials'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import MaterialFilters, { type MaterialFilterState } from '@/components/materials/MaterialFilters'
import MaterialCard from '@/components/materials/MaterialCard'

function MaterialsContent() {
  const searchParams = useSearchParams()

  const subjects = useAppStore((state) => state.subjects)
  const user = useAppStore((state) => state.user)

  const { materials, labs, isLoading, error } = useMaterials()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<MaterialFilterState>({
    search: searchParams.get('search') || '',
    selectedSubject: searchParams.get('subject') || '',
    selectedLab: '',
    selectedFileType: '',
    sortBy: 'newest',
  })

  const updateFilters = (patch: Partial<MaterialFilterState>) =>
    setFilters((current) => ({ ...current, ...patch }))

  const resetFilters = () =>
    updateFilters({ search: '', selectedSubject: '', selectedLab: '', selectedFileType: '' })

  const availableLabs = useMemo(() => {
    if (!filters.selectedSubject) return []
    return labs.filter((l) => l.subject_id === filters.selectedSubject)
  }, [filters.selectedSubject, labs])

  const filteredMaterials = useMemo(() => {
    const { search, selectedSubject, selectedLab, selectedFileType, sortBy } = filters
    return materials
      .filter((item) => {
        if (item.is_hidden) return false
        if (selectedSubject && item.subject_id !== selectedSubject) return false
        if (selectedLab && item.lab_id !== selectedLab) return false
        if (selectedFileType && item.file_type !== selectedFileType) return false

        if (search.trim()) {
          const q = search.toLowerCase().trim()
          const matchTitle = item.title.toLowerCase().includes(q)
          const matchDesc = item.description?.toLowerCase().includes(q)
          const matchCode = item.subjects?.code.toLowerCase().includes(q)
          const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q))
          return matchTitle || matchDesc || matchCode || matchTag
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') return b.download_count - a.download_count
        if (sortBy === 'admin') return a.sort_order - b.sort_order
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [materials, filters])

  const hasActiveFilters =
    filters.selectedSubject || filters.selectedLab || filters.selectedFileType || filters.search

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        icon={FolderKanban}
        iconClassName="w-6 h-6 text-indigo-600 dark:text-indigo-400"
        title="Class Study Materials"
        subtitle="Syllabus guides, practical experiment manuals, solution codes, and lecture videos."
        actions={
          <>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <FilterIcon className="w-4 h-4" /> Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
            </button>

            {user && (
              <Link
                href="/materials/upload"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" /> Upload Material
              </Link>
            )}
          </>
        }
      />

      {/* Main Layout: Left Sidebar Filters + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <MaterialFilters
          subjects={subjects}
          availableLabs={availableLabs}
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          hasActiveFilters={!!hasActiveFilters}
          showOnMobile={showFilters}
          onClose={() => setShowFilters(false)}
        />

        {/* Right Materials Card Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 font-mono">
            <span>Showing {filteredMaterials.length} materials</span>
            {filters.selectedSubject && (
              <span className="text-indigo-600 dark:text-indigo-400">
                Filtered by Subject: {subjects.find((s) => s.id === filters.selectedSubject)?.code}
              </span>
            )}
          </div>

          {isLoading ? (
            <EmptyState icon={Inbox} title="Loading materials…" />
          ) : error ? (
            <EmptyState icon={Inbox} title="Couldn't load materials" description={error.message} />
          ) : filteredMaterials.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No materials found"
              description={
                hasActiveFilters
                  ? 'Try adjusting your search criteria or subject filters.'
                  : 'Course materials will appear here once uploaded.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map((item) => (
                <MaterialCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500 dark:text-gray-400 p-8 text-center">Loading materials...</div>}>
      <MaterialsContent />
    </Suspense>
  )
}
