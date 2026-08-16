'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { fetchLiveMaterials, fetchLiveLabs } from '@/lib/supabase-data'
import { Material, Lab } from '@/lib/types'
import { formatDate, formatBytes, getSubjectColor, getFileTypeInfo } from '@/lib/utils'
import {
  FolderKanban,
  FileText,
  Video,
  Code,
  Archive,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Tag,
  Eye,
  CheckCircle,
  Inbox,
  X,
} from 'lucide-react'

function MaterialsContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const { subjects, user } = useAppStore()
  const [materials, setMaterials] = useState<Material[]>([])
  const [labs, setLabs] = useState<Lab[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [matData, labData] = await Promise.all([
        fetchLiveMaterials(),
        fetchLiveLabs(),
      ])
      setMaterials(matData)
      setLabs(labData)
    }
    loadData()
  }, [])

  // Filters state
  const [search, setSearch] = useState(initialSearch)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedLab, setSelectedLab] = useState<string>('')
  const [selectedFileType, setSelectedFileType] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'admin'>('newest')

  const availableLabs = useMemo(() => {
    if (!selectedSubject) return []
    return labs.filter((l) => l.subject_id === selectedSubject)
  }, [selectedSubject, labs])

  const filteredMaterials = useMemo(() => {
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
  }, [materials, selectedSubject, selectedLab, selectedFileType, search, sortBy])

  const getFileIcon = (fileType?: string | null) => {
    const info = getFileTypeInfo(fileType)
    switch (fileType) {
      case 'pdf':
        return <FileText className={`w-5 h-5 ${info.colorClass}`} />
      case 'code':
        return <Code className={`w-5 h-5 ${info.colorClass}`} />
      case 'video':
        return <Video className={`w-5 h-5 ${info.colorClass}`} />
      case 'zip':
        return <Archive className={`w-5 h-5 ${info.colorClass}`} />
      default:
        return <FileText className={`w-5 h-5 ${info.colorClass}`} />
    }
  }

  const hasActiveFilters = selectedSubject || selectedLab || selectedFileType || search

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Class Study Materials
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Syllabus guides, practical experiment manuals, solution codes, and lecture videos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Filter className="w-4 h-4" /> Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
          </button>

          {user && (
            <Link
              href="/materials/upload"
              className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Upload Material
            </Link>
          )}
        </div>
      </div>

      {/* Main Layout: Left Sidebar Filters + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar — collapsible on mobile */}
        <div className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Filter Materials
              </h2>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSelectedSubject('')
                      setSelectedLab('')
                      setSelectedFileType('')
                      setSearch('')
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, topic, tag..."
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setSelectedLab('')
                }}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
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
            {selectedSubject && availableLabs.length > 0 && (
              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                  Lab Practical
                </label>
                <select
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
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
              <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                Resource Type
              </label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Types', value: '' },
                  { label: 'PDF Documents', value: 'pdf' },
                  { label: 'Source Code', value: 'code' },
                  { label: 'Video Lectures', value: 'video' },
                  { label: 'Zip Archives', value: 'zip' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedFileType(item.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                      selectedFileType === item.value
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-500/40'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedFileType === item.value && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'downloads' | 'admin')}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
              >
                <option value="newest">Newest First</option>
                <option value="downloads">Most Downloaded</option>
                <option value="admin">Curated Admin Order</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Materials Card Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 font-mono">
            <span>Showing {filteredMaterials.length} materials</span>
            {selectedSubject && (
              <span className="text-indigo-600 dark:text-indigo-400">
                Filtered by Subject: {subjects.find((s) => s.id === selectedSubject)?.code}
              </span>
            )}
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center space-y-3">
              <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No materials found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasActiveFilters
                  ? 'Try adjusting your search criteria or subject filters.'
                  : 'Course materials will appear here once uploaded.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                        {getFileIcon(item.file_type)}
                      </div>

                      {item.subjects && (
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getSubjectColor(
                            item.subjects.code
                          )}`}
                        >
                          {item.subjects.code}
                        </span>
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/materials/${item.id}`}
                        className="text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-tight line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-mono bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 dark:border-gray-700/60 text-xs font-mono text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>{formatDate(item.created_at)}</span>
                      {item.file_size_bytes && <span>• {formatBytes(item.file_size_bytes)}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/materials/${item.id}`}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-indigo-600 text-gray-600 dark:text-gray-300 hover:text-white p-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                        title="View Preview & Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/materials/${item.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" /> ({item.download_count})
                      </Link>
                    </div>
                  </div>
                </div>
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
