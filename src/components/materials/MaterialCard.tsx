'use client'

import Link from 'next/link'
import { Archive, Code, Download, Eye, FileText, Tag, Video } from 'lucide-react'
import { Material } from '@/lib/types'
import { formatBytes, formatDate, getFileTypeInfo, getSubjectColor } from '@/lib/utils'

function FileIcon({ fileType }: { fileType?: string | null }) {
  const info = getFileTypeInfo(fileType)
  switch (fileType) {
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

export default function MaterialCard({ item }: { item: Material }) {
  return (
    <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all group">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
            <FileIcon fileType={item.file_type} />
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
  )
}
