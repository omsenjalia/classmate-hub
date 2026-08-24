'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useMaterialDetail } from '@/hooks/useMaterialDetail'
import MaterialHeaderCard from '@/components/materials/MaterialHeaderCard'
import EditMaterialForm from '@/components/materials/EditMaterialForm'
import VersionHistory from '@/components/materials/VersionHistory'
import ResourcePreview from '@/components/materials/ResourcePreview'

export default function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const subjects = useAppStore((state) => state.subjects)
  const [versioning, setVersioning] = useState(false)
  const [versionProgress, setVersionProgress] = useState(0)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    material,
    loading,
    user,
    downloadCount,
    bookmarked,
    versions,
    availableLabs,
    canManage,
    registerDownload,
    toggleBookmark,
    remove,
    saveMetadata,
    publishNewVersion,
  } = useMaterialDetail(resolvedParams.id)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Materials List
        </Link>
        <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm text-muted">Loading material...</p>
        </div>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Materials List
        </Link>

        <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-elevated flex items-center justify-center mx-auto">
            <Eye className="w-7 h-7 text-muted" />
          </div>
          <h2 className="text-xl font-bold text-primary font-display">Material Not Found</h2>
          <p className="text-sm text-muted max-w-xs mx-auto">
            The material link may have expired, been removed, or moved.
          </p>
          <Link
            href="/materials"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Back to Materials
          </Link>
        </div>
      </div>
    )
  }

  const handleDownload = () => {
    registerDownload()
    toast.success('Download started!')

    if (material.file_url) {
      window.open(material.file_url, '_blank')
    } else if (material.video_url) {
      window.open(material.video_url, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this material?')) return

    const ok = await remove()
    if (ok) {
      toast.success('Material deleted')
      router.push('/materials')
    } else {
      toast.error('Failed to delete material')
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleToggleBookmark = async () => {
    const ok = await toggleBookmark()
    if (!ok) {
      toast.error(user ? 'Could not update bookmark' : 'Please sign in to bookmark materials')
      return
    }
    toast.success(bookmarked ? 'Bookmark removed' : 'Material bookmarked')
  }

  const handleSaveMetadata = async (draft: Parameters<typeof saveMetadata>[0]) => {
    if (!canManage) return toast.error('You do not have permission to edit this material')
    setSaving(true)
    const ok = await saveMetadata(draft)
    setSaving(false)

    if (!ok) return toast.error('Could not save material changes')
    setEditing(false)
    toast.success('Material details updated')
  }

  const handleVersionUpload = async (file: File) => {
    try {
      setVersioning(true)
      setVersionProgress(0)
      await publishNewVersion(file, setVersionProgress)
      setVersionProgress(100)
      toast.success('New version published')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not publish new version')
    } finally {
      setVersioning(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Back Link */}
      <Link
        href="/materials"
        className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Materials List
      </Link>

      <MaterialHeaderCard
        material={material}
        bookmarked={bookmarked}
        canManage={canManage}
        versioning={versioning}
        downloadCount={downloadCount}
        onDownload={handleDownload}
        onShare={handleShare}
        onDelete={handleDelete}
        onEdit={() => setEditing(true)}
        onToggleBookmark={handleToggleBookmark}
        onVersionFile={handleVersionUpload}
      />

      {editing && (
        <EditMaterialForm
          material={material}
          subjects={subjects}
          availableLabs={availableLabs}
          saving={saving}
          onSave={handleSaveMetadata}
          onClose={() => setEditing(false)}
        />
      )}

      {versioning && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex justify-between text-xs text-muted">
            <span>Uploading newer version...</span>
            <span>{versionProgress}%</span>
          </div>
          <div className="h-2 bg-page rounded-full mt-2">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${versionProgress}%` }} />
          </div>
        </div>
      )}

      <VersionHistory versions={versions} />

      {/* Document / Video Preview Section */}
      <ResourcePreview material={material} />
    </div>
  )
}
