'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { MOCK_MATERIALS, MOCK_LABS } from '@/lib/mock-data'
import { Material } from '@/lib/types'
import { formatDate, formatBytes, getSubjectColor } from '@/lib/utils'
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
} from 'lucide-react'

function MaterialsContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const { subjects, user } = useAppStore()
  const [materials] = useState<Material[]>(MOCK_MATERIALS)

  // Filters state
  const [search, setSearch] = useState(initialSearch)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedLab, setSelectedLab] = useState<string>('')
  const [selectedFileType, setSelectedFileType] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'admin'>('newest')

  const availableLabs = useMemo(() => {
    if (!selectedSubject) return []
    return MOCK_LABS.filter((l) => l.subject_id === selectedSubject)
  }, [selectedSubject])

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
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />
      case 'code':
        return <Code className="w-5 h-5 text-blue-400" />
      case 'video':
        return <Video className="w-5 h-5 text-[#4F6EF7]" />
      case 'zip':
        return <Archive className="w-5 h-5 text-emerald-400" />
      default:
        return <FileText className="w-5 h-5 text-amber-400" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#4F6EF7]" /> Class Study Materials
          </h1>
          <p className="text-sm text-[#8B91A8] mt-1">
            Syllabus guides, practical experiment manuals, solution codes, and lecture videos.
          </p>
        </div>

        {user && (
          <Link
            href="/materials/upload"
            className="self-start sm:self-auto bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#4F6EF7]/20"
          >
            <Plus className="w-4 h-4" /> Upload Material
          </Link>
        )}
      </div>

      {/* Main Layout: Left Sidebar Filters + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#2D3148] pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#4F6EF7]" /> Filter Materials
              </h2>
              {(selectedSubject || selectedLab || selectedFileType || search) && (
                <button
                  onClick={() => {
                    setSelectedSubject('')
                    setSelectedLab('')
                    setSelectedFileType('')
                    setSearch('')
                  }}
                  className="text-[11px] text-[#4F6EF7] hover:underline font-mono"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-mono text-[#8B91A8] uppercase mb-1.5">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8B91A8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, topic, tag..."
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-[#8B91A8]/60 focus:outline-none focus:border-[#4F6EF7]"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-[11px] font-mono text-[#8B91A8] uppercase mb-1.5">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setSelectedLab('')
                }}
                className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4F6EF7]"
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
                <label className="block text-[11px] font-mono text-[#8B91A8] uppercase mb-1.5">
                  Lab Practical
                </label>
                <select
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4F6EF7]"
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
              <label className="block text-[11px] font-mono text-[#8B91A8] uppercase mb-1.5">
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
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedFileType === item.value
                        ? 'bg-[#4F6EF7]/20 text-[#4F6EF7] font-semibold border border-[#4F6EF7]/40'
                        : 'text-[#8B91A8] hover:text-white hover:bg-[#242736]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedFileType === item.value && <CheckCircle className="w-3.5 h-3.5 text-[#4F6EF7]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div className="pt-2 border-t border-[#2D3148]">
              <label className="block text-[11px] font-mono text-[#8B91A8] uppercase mb-1.5 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#4F6EF7]" /> Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4F6EF7]"
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
          <div className="flex items-center justify-between text-xs text-[#8B91A8] font-mono">
            <span>Showing {filteredMaterials.length} materials</span>
            {selectedSubject && (
              <span className="text-[#4F6EF7]">
                Filtered by Subject: {subjects.find((s) => s.id === selectedSubject)?.code}
              </span>
            )}
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-12 text-center space-y-3">
              <FolderKanban className="w-10 h-10 text-[#8B91A8] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-white font-display">No materials found</h3>
              <p className="text-xs text-[#8B91A8]">
                Try adjusting your search criteria or subject filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1A1D27] border border-[#2D3148] hover:border-[#4F6EF7]/40 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all hover:bg-[#1A1D27]/90 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0F1117] border border-[#2D3148] flex items-center justify-center shrink-0">
                        {getFileIcon(item.file_type)}
                      </div>

                      {item.subjects && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSubjectColor(
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
                        className="text-base font-bold text-white font-display hover:text-[#4F6EF7] transition-colors leading-tight line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-[#8B91A8] mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono bg-[#0F1117] border border-[#2D3148] text-[#8B91A8] px-2 py-0.5 rounded flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#2D3148]/60 text-xs font-mono text-[#8B91A8]">
                    <div className="flex items-center gap-2">
                      <span>{formatDate(item.created_at)}</span>
                      {item.file_size_bytes && <span>• {formatBytes(item.file_size_bytes)}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/materials/${item.id}`}
                        className="bg-[#242736] hover:bg-[#4F6EF7] text-white p-2 rounded-lg transition-colors border border-[#2D3148]"
                        title="View Preview & Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/materials/${item.id}`}
                        className="bg-[#4F6EF7] hover:bg-[#3B55D4] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
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
    <Suspense fallback={<div className="text-xs text-[#8B91A8] p-8 text-center">Loading materials...</div>}>
      <MaterialsContent />
    </Suspense>
  )
}
