'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { ArrowRight, FileText, Loader2, Upload, Video, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import { formatBytes } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { fetchLiveLabs } from '@/lib/supabase-data'
import { uploadFileInGithubChunks } from '@/lib/github-upload'
import { useAppStore } from '@/store/useAppStore'
import type { Lab } from '@/lib/types'

function getFileType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') return 'pdf'
  if (['c', 'py', 'java', 'js', 'ts'].includes(extension || '')) return 'code'
  if (['png', 'jpg', 'jpeg'].includes(extension || '')) return 'image'
  if (['zip', 'rar'].includes(extension || '')) return 'zip'
  return 'docx'
}

export default function MaterialUploadPage() {
  const router = useRouter()
  const { user, subjects } = useAppStore()
  const [mode, setMode] = useState<'file' | 'video'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [labId, setLabId] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [labs, setLabs] = useState<Lab[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => { fetchLiveLabs().then(setLabs) }, [])
  const availableLabs = useMemo(() => labs.filter((lab) => lab.subject_id === subjectId), [labs, subjectId])

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length) return toast.error(rejected[0].errors[0]?.message || 'File was rejected')
    const selected = accepted[0]
    if (!selected) return
    setFile(selected)
    setTitle((current) => current || selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '))
  }, [])
  const dropzone = useDropzone({ onDrop, maxFiles: 1, maxSize: MAX_FILE_SIZE_BYTES })

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return toast.error('Please sign in before publishing material')
    if (!title.trim()) return toast.error('Please enter a title')
    if (mode === 'file' && !file) return toast.error('Please choose a file')
    if (mode === 'video' && !videoUrl.trim()) return toast.error('Please enter a video URL')

    setUploading(true)
    setProgress(0)
    let uploadedKey: string | null = null
    try {
      let fileUrl: string | null = null
      if (file) {
        const upload = await uploadFileInGithubChunks(file, setProgress)
        uploadedKey = upload.key
        fileUrl = upload.publicUrl
      }
      const tags = tagsInput.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean)
      const { data, error } = await createClient().from('materials').insert({
        title: title.trim(), description: description.trim() || null,
        file_url: fileUrl, file_key: uploadedKey, file_name: file?.name || null,
        file_type: mode === 'file' && file ? getFileType(file.name) : 'video',
        file_size_bytes: file?.size || null, video_url: mode === 'video' ? videoUrl.trim() : null,
        subject_id: subjectId || null, lab_id: labId || null, tags: tags.length ? tags : null,
        uploaded_by: user.id, sort_order: 0, is_hidden: false, download_count: 0,
      }).select('id').single()
      if (error || !data) throw new Error(error?.message || 'Failed to save material details')
      setProgress(100)
      toast.success('Material published')
      router.push(`/materials/${data.id}`)
    } catch (error) {
      if (uploadedKey) await fetch(`/api/upload/${uploadedKey}`, { method: 'DELETE' }).catch(() => undefined)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return <div className="max-w-2xl mx-auto space-y-6">
    <div><h1 className="text-2xl font-bold text-primary flex items-center gap-2"><Upload className="w-6 h-6 text-indigo-500" /> Upload Study Material</h1><p className="text-sm text-muted mt-1">Files are securely stored in the class GitHub repository.</p></div>
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xl">
      <div className="flex bg-page p-1 rounded-xl border border-border">
        <button type="button" onClick={() => setMode('file')} className={`flex-1 py-2 rounded-lg text-xs font-medium ${mode === 'file' ? 'bg-indigo-600 text-white' : 'text-muted'}`}><FileText className="w-4 h-4 inline mr-2" />File</button>
        <button type="button" onClick={() => setMode('video')} className={`flex-1 py-2 rounded-lg text-xs font-medium ${mode === 'video' ? 'bg-indigo-600 text-white' : 'text-muted'}`}><Video className="w-4 h-4 inline mr-2" />Video link</button>
      </div>
      {mode === 'file' ? file ? <div className="bg-page border border-border rounded-xl p-4 flex justify-between"><span className="text-sm text-primary"><FileText className="w-4 h-4 inline mr-2" />{file.name} <small className="text-muted">{formatBytes(file.size)}</small></span><button type="button" onClick={() => setFile(null)} className="text-muted"><X /></button></div> : <div {...dropzone.getRootProps()} className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer"><input {...dropzone.getInputProps()} /><Upload className="w-7 h-7 text-indigo-500 mx-auto mb-2" /><p className="text-sm text-primary">Drop a file here or click to select</p><p className="text-xs text-muted mt-1">Maximum size: 100MB</p></div> : <input required type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube or Google Drive URL" className="w-full bg-page border border-border rounded-xl px-4 py-2.5 text-sm text-primary" />}
      <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Material title" className="w-full bg-page border border-border rounded-xl px-4 py-2.5 text-sm text-primary" />
      <div className="grid sm:grid-cols-2 gap-4"><select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setLabId('') }} className="bg-page border border-border rounded-xl px-3 py-2.5 text-sm text-primary"><option value="">General material</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.name}</option>)}</select><select value={labId} onChange={(e) => setLabId(e.target.value)} disabled={!availableLabs.length} className="bg-page border border-border rounded-xl px-3 py-2.5 text-sm text-primary disabled:opacity-50"><option value="">Lecture / general notes</option>{availableLabs.map((lab) => <option key={lab.id} value={lab.id}>{lab.name}</option>)}</select></div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full bg-page border border-border rounded-xl px-4 py-2.5 text-sm text-primary" />
      <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags, comma separated" className="w-full bg-page border border-border rounded-xl px-4 py-2.5 text-sm text-primary" />
      {uploading && <div className="space-y-1"><div className="flex justify-between text-xs text-muted"><span>Uploading to GitHub storage...</span><span>{progress}%</span></div><div className="h-2 bg-page rounded-full"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} /></div></div>}
      <button disabled={uploading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">{uploading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Uploading ({progress}%)</> : <>Publish Material <ArrowRight className="w-4 h-4 inline ml-1" /></>}</button>
    </form>
  </div>
}
