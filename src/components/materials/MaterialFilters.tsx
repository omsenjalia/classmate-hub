'use client'

import { ArrowUpDown, CheckCircle, Filter, Search, X } from 'lucide-react'
import { Lab, Subject } from '@/lib/types'

export interface MaterialFilterState {
  search: string
  selectedSubject: string
  selectedLab: string
  selectedFileType: string
  sortBy: 'newest' | 'downloads' | 'admin'
}

interface MaterialFiltersProps {
  subjects: Subject[]
  availableLabs: Lab[]
  filters: MaterialFilterState
  onChange: (patch: Partial<MaterialFilterState>) => void
  onReset: () => void
  hasActiveFilters: boolean
  showOnMobile: boolean
  onClose: () => void
}

const FILE_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'PDF Documents', value: 'pdf' },
  { label: 'Source Code', value: 'code' },
  { label: 'Video Lectures', value: 'video' },
  { label: 'Zip Archives', value: 'zip' },
]

/** Left filter sidebar for the materials catalog (collapsible on mobile). */
export default function MaterialFilters({
  subjects,
  availableLabs,
  filters,
  onChange,
  onReset,
  hasActiveFilters,
  showOnMobile,
  onClose,
}: MaterialFiltersProps) {
  const filterLabelClassName =
    'block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5'
  const filterSelectClassName =
    'w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400'

  return (
    <div className={`lg:col-span-1 space-y-6 ${showOnMobile ? 'block' : 'hidden lg:block'}`}>
      <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Filter Materials
          </h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div>
          <label className={filterLabelClassName}>
            Keyword Search
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Title, topic, tag..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <label className={filterLabelClassName}>
            Subject
          </label>
          <select
            value={filters.selectedSubject}
            onChange={(e) => onChange({ selectedSubject: e.target.value, selectedLab: '' })}
            className={filterSelectClassName}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} • {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lab Filter */}
        {filters.selectedSubject && availableLabs.length > 0 && (
          <div>
            <label className={filterLabelClassName}>
              Lab Practical
            </label>
            <select
              value={filters.selectedLab}
              onChange={(e) => onChange({ selectedLab: e.target.value })}
              className={filterSelectClassName}
            >
              <option value="">All Labs / Lectures</option>
              {availableLabs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* File Type Filter */}
        <div>
          <label className={filterLabelClassName}>
            Resource Type
          </label>
          <div className="space-y-1.5">
            {FILE_TYPE_OPTIONS.map((item) => (
              <button
                key={item.value}
                onClick={() => onChange({ selectedFileType: item.value })}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                  filters.selectedFileType === item.value
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-500/40'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <span>{item.label}</span>
                {filters.selectedFileType === item.value && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Order */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <label className={`${filterLabelClassName} flex items-center gap-1`}>
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as MaterialFilterState['sortBy'] })}
            className={filterSelectClassName}
          >
            <option value="newest">Newest First</option>
            <option value="downloads">Most Downloaded</option>
            <option value="admin">Curated Admin Order</option>
          </select>
        </div>
      </div>
    </div>
  )
}
