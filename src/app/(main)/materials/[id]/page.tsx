'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Material } from '@/lib/types'
import { MaterialVersion } from '@/lib/types'
import { uploadFileInGithubChunks } from '@/lib/github-upload'
import { formatDate, formatBytes, getSubjectColor } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
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
  Eye,
  Loader2,
  Bookmark,
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
  const [loading, setLoading] = useState(true)
  const [downloadCount, setDownloadCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [versions, setVersions] = useState<MaterialVersion[]>([])
  const [versioning, setVersioning] = useState(false)

  useEffect(() => {
    async function fetchMaterial() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('materials')
          .select('*, profiles(*), subjects(*), labs(*)')
          .eq('id', resolvedParams.id)
          .single()

        if (error || !data) {
          setMaterial(null)
        } else {
          setMaterial(data as Material)
          setDownloadCount(data.download_count || 0)
        }
      } catch {
        setMaterial(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMaterial()
  }, [resolvedParams.id])

  useEffect(() => {
    if (!user) return
    createClient().from('bookmarks').select('id').eq('user_id', user.id).eq('material_id', resolvedParams.id).maybeSingle()
      .then(({ data }) => setBookmarked(Boolean(data)))
  }, [resolvedParams.id, user])

  useEffect(() => {
    createClient().from('material_versions').select('*').eq('material_id', resolvedParams.id).order('version_number', { ascending: false })
      .then(({ data }) => setVersions((data || []) as MaterialVersion[]))
  }, [resolvedParams.id])

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

  const isOwner = user?.id === material.uploaded_by
  const isAdmin = user?.role === 'admin'
  const canDelete = isOwner || isAdmin

  const handleDownload = async () => {
    setDownloadCount((prev) => prev + 1)
    toast.success('Download started!')

    // Increment download count in Supabase (fire-and-forget)
    const supabase = createClient()
    supabase
      .from('materials')
      .update({ download_count: downloadCount + 1 })
      .eq('id', material.id)
      .then(() => {})

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
        // The server performs both the ownership check and object + metadata
        // deletion, preventing orphaned files and client-side race conditions.
        const response = await fetch(`/api/upload/${material.file_key}`, { method: 'DELETE' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to delete the stored file')
        }
      } else {
        const supabase = createClient()
        const { error } = await supabase.from('materials').delete().eq('id', material.id)
        if (error) throw new Error(error.message)
      }

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

  const toggleBookmark = async () => {
    if (!user || !material) return toast.error('Please sign in to bookmark materials')
    const supabase = createClient()
    const { error } = bookmarked
      ? await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('material_id', material.id)
      : await supabase.from('bookmarks').insert({ user_id: user.id, material_id: material.id })
    if (error) return toast.error(error.message)
    setBookmarked((value) => !value)
    toast.success(bookmarked ? 'Bookmark removed' : 'Material bookmarked')
  }

  const uploadNewVersion = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile || !material || !user) return
    setVersioning(true)
    try {
      const upload = await uploadFileInGithubChunks(nextFile)
      const supabase = createClient()
      const nextNumber = (versions[0]?.version_number || 0) + 1
      const { error: versionError } = await supabase.from('material_versions').insert({
        material_id: material.id, version_number: nextNumber, file_url: material.file_url,
        file_key: material.file_key, file_name: material.file_name, file_size_bytes: material.file_size_bytes,
        change_note: `Replaced with ${nextFile.name}`, created_by: user.id,
      })
      if (versionError) throw new Error(versionError.message)
      const { error } = await supabase.from('materials').update({ file_url: upload.publicUrl, file_key: upload.key, file_name: nextFile.name, file_size_bytes: nextFile.size, file_type: nextFile.name.endsWith('.pdf') ? 'pdf' : material.file_type }).eq('id', material.id)
      if (error) throw new Error(error.message)
      setMaterial({ ...material, file_url: upload.publicUrl, file_key: upload.key, file_name: nextFile.name, file_size_bytes: nextFile.size })
      setVersions((current) => [{ id: `local-${nextNumber}`, material_id: material.id, version_number: nextNumber, file_url: material.file_url, file_key: material.file_key, file_name: material.file_name, file_size_bytes: material.file_size_bytes, change_note: `Replaced with ${nextFile.name}`, created_by: user.id, created_at: new Date().toISOString() }, ...current])
      toast.success('New version published')
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not publish new version') } finally { setVersioning(false); event.target.value = '' }
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

      {/* Main Header Card */}
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
            <button onClick={toggleBookmark} className={`p-2.5 border rounded-xl transition-colors ${bookmarked ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-500' : 'bg-elevated border-border text-primary'}`} title="Bookmark material">
              <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 bg-elevated hover:bg-border border border-border text-primary rounded-xl transition-colors cursor-pointer"
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
            {canDelete && <label className="p-2.5 bg-elevated border border-border text-primary rounded-xl cursor-pointer" title="Upload a newer version">
              <FileText className="w-4 h-4" />
              <input type="file" className="hidden" onChange={uploadNewVersion} disabled={versioning} />
            </label>}

            <button
              onClick={handleDownload}
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

      {versions.length > 0 && <section className="bg-card border border-border rounded-2xl p-5"><h2 className="text-sm font-bold text-primary">Version history</h2><div className="mt-3 space-y-2">{versions.map((version) => <a key={version.id} href={version.file_url || '#'} target="_blank" rel="noreferrer" className="flex justify-between text-sm rounded-lg bg-page p-3 hover:text-indigo-500"><span>Version {version.version_number} · {version.file_name}</span><span className="text-muted">{formatDate(version.created_at)}</span></a>)}</div></section>}

      {/* Document / Video Preview Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" /> Resource Preview
        </h2>

        {material.video_url ? (
          <VideoEmbed url={material.video_url} />
        ) : material.file_url ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl min-h-[500px] flex flex-col">
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
                className="w-full max-h-[600px] object-contain p-4 bg-page"
              />
            ) : (
              <div className="p-6 font-mono text-xs text-primary bg-page overflow-x-auto space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3 text-muted">
                  <span>{material.file_name || 'source_code'}</span>
                  <span>Syntax Highlighting</span>
                </div>
                <pre className="text-emerald-400 leading-relaxed">
                  {`/* ClassmateHub Resource: ${material.title} */\n// Subject: ${material.subjects?.name || 'General'}\n// Date: ${formatDate(material.created_at)}\n\n#include <stdio.h>\n\nint main() {\n    printf("ClassmateHub Code Preview\\n");\n    return 0;\n}`}
                </pre>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
