'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone, FileRejection } from 'react-dropzone'
import { useAppStore } from '@/store/useAppStore'
import { MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import { formatBytes } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  Upload,
  FileText,
  Video,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function MaterialUploadPage() {
  const router = useRouter()
  const { user, subjects } = useAppStore()

  const [mode, setMode] = useState<'file' | 'video'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [labId, setLabId] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Labs would come from a store or API keyed by subject — for now initialize empty
  const availableLabs: { id: string; name: string; subject_id: string; sort_order: number }[] = []

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const err = rejectedFiles[0]?.errors?.[0]?.message
      toast.error(err || 'File rejected. Make sure size is under 100MB.')
      return
    }
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0]
      if (selected.size > MAX_FILE_SIZE_BYTES) {
        toast.error('File size exceeds the maximum 100MB limit!')
        return
      }
      setFile(selected)
      if (!title) {
        // Auto fill title from file name without extension
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
        setTitle(cleanName)
      }
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_BYTES,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (mode === 'file' && !file) {
      toast.error('Please drop or select a file')
      return
    }

    if (mode === 'video' && !videoUrl.trim()) {
      toast.error('Please enter a YouTube or Google Drive URL')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let finalFileUrl: string | null = null
      let finalFileKey: string | null = null
      let detectedFileType = mode === 'video' ? 'video' : 'pdf'

      if (mode === 'file' && file) {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        if (['pdf'].includes(ext)) detectedFileType = 'pdf'
        else if (['c', 'py', 'java', 'js', 'ts'].includes(ext)) detectedFileType = 'code'
        else if (['png', 'jpg', 'jpeg'].includes(ext)) detectedFileType = 'image'
        else if (['zip', 'rar'].includes(ext)) detectedFileType = 'zip'
        else detectedFileType = 'docx'

        // 1. Try R2 presigned upload first
        let r2Success = false
        try {
          const presignRes = await fetch('/api/upload/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              contentType: file.type || 'application/octet-stream',
              fileSize: file.size,
            }),
          })

          if (presignRes.ok) {
            const { presignedUrl, key, publicUrl } = await presignRes.json()

            // Upload directly to R2 with progress tracking
            const r2Result = await new Promise<boolean>((resolve) => {
              const xhr = new XMLHttpRequest()
              xhr.open('PUT', presignedUrl, true)
              xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

              xhr.upload.onprogress = (evt) => {
                if (evt.lengthComputable) {
                  const percent = Math.round((evt.loaded / evt.total) * 90) // reserve last 10% for DB save
                  setUploadProgress(percent)
                }
              }

              xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 204) {
                  finalFileUrl = publicUrl
                  finalFileKey = key
                  resolve(true)
                } else {
                  resolve(false)
                }
              }

              xhr.onerror = () => resolve(false)
              xhr.send(file)
            })

            r2Success = r2Result
          }
        } catch {
          // R2 not configured or failed — fall through to GitHub storage
        }

        // 2. Fallback: upload via GitHub storage API
        if (!r2Success) {
          setUploadProgress(20)
          const formData = new FormData()
          formData.append('file', file)

          const githubRes = await fetch('/api/upload/github', {
            method: 'POST',
            body: formData,
          })

          if (!githubRes.ok) {
            const errData = await githubRes.json().catch(() => ({}))
            throw new Error(errData.error || 'File upload failed. Please try again.')
          }

          const githubData = await githubRes.json()
          finalFileUrl = githubData.publicUrl
          finalFileKey = githubData.key
          setUploadProgress(85)
        }
      }

      // 3. Save material metadata to Supabase
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      const supabase = createClient()
      const { data: inserted, error: insertError } = await supabase
        .from('materials')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          file_url: finalFileUrl,
          file_key: finalFileKey,
          file_name: file?.name || null,
          file_type: detectedFileType,
          file_size_bytes: file?.size || null,
          video_url: mode === 'video' ? videoUrl.trim() : null,
          subject_id: subjectId || null,
          lab_id: labId || null,
          tags: tags.length > 0 ? tags : null,
          uploaded_by: user?.id || null,
          sort_order: 0,
          is_hidden: false,
          download_count: 0,
        })
        .select('id')
        .single()

      if (insertError || !inserted) {
        throw new Error(insertError?.message || 'Failed to save material to database')
      }

      setUploadProgress(100)
      toast.success('Material published successfully!')
      router.push(`/materials/${inserted.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
          <Upload className="w-6 h-6 text-indigo-500" /> Upload Study Material
        </h1>
        <p className="text-sm text-muted mt-1">
          Share lecture slides, lab manuals, sample code, or YouTube lecture links with your class.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Toggle Mode: File vs Video URL */}
        <div className="flex bg-page p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${mode === 'file' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted hover:text-primary'
              }`}
          >
            <FileText className="w-4 h-4" /> Upload Document / Code (100MB Cap)
          </button>
          <button
            type="button"
            onClick={() => setMode('video')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${mode === 'video' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted hover:text-primary'
              }`}
          >
            <Video className="w-4 h-4" /> YouTube / Drive Video Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Drag and Drop Zone */}
          {mode === 'file' && (
            <div>
              <label className="block text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">
                File Attachment (PDF, DOCX, Code, Zip, Images)
              </label>

              {file ? (
                <div className="bg-page border border-indigo-500/40 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary truncate max-w-xs">{file.name}</p>
                      <p className="text-[10px] font-mono text-muted">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 text-muted hover:text-red-400 rounded-lg hover:bg-elevated"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-border hover:border-indigo-500/50 bg-page/60'
                    }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-12 h-12 rounded-full bg-elevated border border-border flex items-center justify-center mx-auto mb-3 text-indigo-500">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-primary">
                    {isDragActive ? 'Drop your file here...' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-[11px] text-muted font-mono mt-1">
                    PDF, DOCX, PNG, JPG, .c, .py, .java, .js, .ts, ZIP (Max 100MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video URL Input */}
          {mode === 'video' && (
            <div>
              <label className="block text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">
                Video Lecture URL (YouTube or Google Drive Share Link)
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-page border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-primary placeholder-muted/60 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. C Programming Lab 4 Array Problems"
              className="w-full bg-page border border-border rounded-xl px-4 py-2.5 text-xs text-primary placeholder-muted/60 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Subject & Lab Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">
                Subject Classification
              </label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value)
                  setLabId('')
                }}
                className="w-full bg-page border border-border rounded-xl px-3 py-2.5 text-xs text-primary focus:outline-none focus:border-indigo-500"
              >
                <option value="">General (No specific subject)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} • {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">
                Lab Experiment (Optional)
              </label>
              <select
                value={labId}
                disabled={!subjectId || availableLabs.length === 0}
                onChange={(e) => setLabId(e.target.value)}
                className="w-full bg-page border border-border rounded-xl px-3 py-2.5 text-xs text-primary focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">Lecture / General Notes</option>
                {availableLabs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this file contains..."
              className="w-full bg-page border border-border rounded-xl px-4 py-2.5 text-xs text-primary placeholder-muted/60 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. c, arrays, solutions, exam"
              className="w-full bg-page border border-border rounded-xl px-4 py-2.5 text-xs text-primary placeholder-muted/60 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Realtime Upload Progress Bar */}
          {uploading && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono text-muted">
                <span>Uploading direct to Cloudflare R2...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-page rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading ({uploadProgress}%)
              </>
            ) : (
              <>
                Publish Material <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
