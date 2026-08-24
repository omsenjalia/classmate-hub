'use client'

import {
  Bookmark,
  Calendar,
  Download,
  FileText,
  Loader2,
  Pencil,
  Share2,
  Tag,
  Trash2,
  User,
} from 'lucide-react'
import { Material } from '@/lib/types'
import { formatBytes, formatDate, getSubjectColor } from '@/lib/utils'

const VERSION_ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg,.c,.py,.java,.js,.ts,.zip,.rar'

interface MaterialHeaderCardProps {
  material: Material
  bookmarked: boolean
  canManage: boolean
  versioning: boolean
  downloadCount: number
  onDownload: () => void
  onShare: () => void
  onDelete: () => void
  onEdit: () => void
  onToggleBookmark: () => void
  onVersionFile: (file: File) => void
}

/** Hero card: title, badges, action row, uploader bar, and tags. */
export default function MaterialHeaderCard({
  material,
  bookmarked,
  canManage,
  versioning,
  downloadCount,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  onToggleBookmark,
  onVersionFile,
}: MaterialHeaderCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {material.subjects && (
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${getSubjectColor(
                  material.subjects.code
                )}`}
              >
                {material.subjects.code} • {material.subjects.name}
              </span>
            )}
            {material.labs && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {material.labs.name}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-primary leading-tight">
            {material.title}
          </h1>

          {material.description && (
            <p className="text-sm text-muted leading-relaxed">{material.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleBookmark}
            className={`p-2.5 border rounded-xl transition-colors ${bookmarked ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-500' : 'bg-elevated border-border text-primary'}`}
            title="Bookmark material"
          >
            <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onShare}
            className="p-2.5 bg-elevated hover:bg-border border border-border text-primary rounded-xl transition-colors cursor-pointer"
            title="Share Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {canManage && (
            <button
              onClick={onDelete}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-colors cursor-pointer"
              title="Delete Material"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {canManage && (
            <button
              onClick={onEdit}
              className="p-2.5 bg-elevated hover:bg-border border border-border text-primary rounded-xl transition-colors"
              title="Edit material details"
              aria-label="Edit material details"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {canManage && (
            <label
              className="p-2.5 bg-elevated hover:bg-border border border-border text-primary rounded-xl cursor-pointer"
              title="Upload a newer version"
              aria-label="Upload a newer version"
            >
              {versioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <input
                type="file"
                accept={VERSION_ACCEPT}
                className="hidden"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0]
                  event.target.value = ''
                  if (nextFile) onVersionFile(nextFile)
                }}
                disabled={versioning}
              />
            </label>
          )}

          <button
            onClick={onDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download ({downloadCount})
          </button>
        </div>
      </div>

      {/* Uploader & Metadata Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted font-mono">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500">
            <User className="w-3.5 h-3.5" />
          </div>
          <span>
            Uploaded by{' '}
            <strong className="text-primary">
              {material.profiles?.display_name || material.profiles?.username || 'Classmate'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {formatDate(material.created_at)}
          </span>
          {material.file_size_bytes && <span>• {formatBytes(material.file_size_bytes)}</span>}
        </div>
      </div>

      {/* Tags */}
      {material.tags && material.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {material.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono bg-page border border-border text-muted px-2.5 py-1 rounded-lg flex items-center gap-1"
            >
              <Tag className="w-3 h-3 text-indigo-500" /> #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
