'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { MOCK_MATERIALS } from '@/lib/mock-data'
import { Material } from '@/lib/types'
import { formatDate, formatBytes, getSubjectColor } from '@/lib/utils'
import VideoEmbed from '@/components/materials/VideoEmbed'
import {
  Download,
  Trash2,
  ArrowLeft,
  FileText,
  User,
  Tag,
  Share2,
  Calendar,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAppStore()

  const [material, setMaterial] = useState<Material | null>(null)
  const [downloadCount, setDownloadCount] = useState(0)

  useEffect(() => {
    const found = MOCK_MATERIALS.find((m) => m.id === resolvedParams.id)
    if (found) {
      setMaterial(found)
      setDownloadCount(found.download_count)
    }
  }, [resolvedParams.id])

  if (!material) {
    return (
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-display">Material Not Found</h2>
        <p className="text-xs text-[#8B91A8]">The material link may have been moved or removed.</p>
        <Link href="/materials" className="inline-block bg-[#4F6EF7] text-white text-xs font-medium px-4 py-2 rounded-lg">
          Back to Materials
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === material.uploaded_by
  const isAdmin = user?.role === 'admin'
  const canDelete = isOwner || isAdmin

  const handleDownload = () => {
    setDownloadCount((prev) => prev + 1)
    material.download_count += 1
    toast.success('Download started!')

    if (material.file_url) {
      window.open(material.file_url, '_blank')
    } else if (material.video_url) {
      window.open(material.video_url, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      if (material.file_key) {
        await fetch(`/api/upload/${material.file_key}`, { method: 'DELETE' })
      }
      const idx = MOCK_MATERIALS.findIndex((m) => m.id === material.id)
      if (idx !== -1) MOCK_MATERIALS.splice(idx, 1)

      toast.success('Material deleted')
      router.push('/materials')
    } catch {
      toast.error('Failed to delete material')
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Back Link */}
      <Link
        href="/materials"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#8B91A8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Materials List
      </Link>

      {/* Main Header Card */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
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

            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white leading-tight">
              {material.title}
            </h1>

            {material.description && (
              <p className="text-sm text-[#8B91A8] leading-relaxed">{material.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="p-2.5 bg-[#242736] hover:bg-[#2D3148] border border-[#2D3148] text-[#E8EAF0] rounded-xl transition-colors cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-colors cursor-pointer"
                title="Delete Material"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDownload}
              className="bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#4F6EF7]/20 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download ({downloadCount})
            </button>
          </div>
        </div>

        {/* Uploader & Metadata Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#2D3148] text-xs text-[#8B91A8] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#4F6EF7]/20 flex items-center justify-center text-[#4F6EF7]">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>
              Uploaded by{' '}
              <strong className="text-white">
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
                className="text-xs font-mono bg-[#0F1117] border border-[#2D3148] text-[#8B91A8] px-2.5 py-1 rounded-lg flex items-center gap-1"
              >
                <Tag className="w-3 h-3 text-[#4F6EF7]" /> #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Document / Video Preview Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#8B91A8] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#4F6EF7]" /> Resource Interactive Preview
        </h2>

        {material.video_url ? (
          <VideoEmbed url={material.video_url} />
        ) : material.file_url ? (
          <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl overflow-hidden shadow-xl min-h-[500px] flex flex-col">
            {material.file_type === 'pdf' ? (
              <iframe
                src={material.file_url}
                className="w-full h-[650px] border-0"
                title={material.title}
              />
            ) : material.file_type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={material.file_url}
                alt={material.title}
                className="w-full max-h-[600px] object-contain p-4 bg-[#0F1117]"
              />
            ) : (
              <div className="p-6 font-mono text-xs text-[#E8EAF0] bg-[#0F1117] overflow-x-auto space-y-4">
                <div className="flex items-center justify-between border-b border-[#2D3148] pb-3 text-[#8B91A8]">
                  <span>{material.file_name || 'source_code'}</span>
                  <span>Syntax Highlighting</span>
                </div>
                <pre className="text-emerald-400 leading-relaxed">
                  {`/* ClassmateHub Resource: ${material.title} */
// Subject: ${material.subjects?.name || 'General'}
// Date: ${formatDate(material.created_at)}

#include <stdio.h>

int main() {
    printf("ClassmateHub Code Preview Solution\\n");
    return 0;
}`}
                </pre>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
