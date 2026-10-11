'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileArrowUpIcon, LinkIcon, LockKeyIcon, XIcon } from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from '@/lib/constants'
import { cn, formatBytes, getFileTypeFromName, parseTags } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { fetchLiveLabs } from '@/lib/supabase-data'
import { uploadFileInGithubChunks } from '@/lib/github-upload'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/layout/PageHeader'
import { Button, ButtonLink, IconButton } from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import FileTile from '@/components/materials/FileTile'
import MaterialFields, { type MaterialFieldValues } from '@/components/materials/MaterialFields'
import { getVideoEmbedUrl } from '@/components/materials/MaterialPreview'
import type { Lab } from '@/lib/types'

const ACCEPT = ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')

type Mode = 'file' | 'video'
type Errors = Partial<Record<'file' | 'video' | 'title', string>>

function titleFromFileName(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function validateFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    return `.${ext || '?'} files aren't supported. Use PDF, DOCX, images, code or ZIP.`
  }
  if (file.size > MAX_FILE_SIZE_BYTES) return `Files must be ${MAX_FILE_SIZE_LABEL} or smaller.`
  return null
}

function UploadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, subjects } = useAppStore()
  const fileInput = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<Mode>('file')
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [values, setValues] = useState<MaterialFieldValues>({
    title: '',
    subjectId: searchParams.get('subject') || '',
    labId: '',
    description: '',
    tags: '',
  })
  const [labs, setLabs] = useState<Lab[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    fetchLiveLabs().then(setLabs)
  }, [])

  if (!user) {
    return (
      <>
        <PageHeader backHref="/materials" />
        <EmptyState
          icon={LockKeyIcon}
          title="Sign in to upload"
          description="Uploads are tied to your student account so classmates know who shared what."
          action={<ButtonLink href="/login">Sign in</ButtonLink>}
        />
      </>
    )
  }

  const pickFile = (selected: File | undefined) => {
    if (!selected) return
    const problem = validateFile(selected)
    if (problem) {
      setErrors((current) => ({ ...current, file: problem }))
      return
    }
    setFile(selected)
    setErrors((current) => ({ ...current, file: undefined }))
    setValues((current) => (current.title ? current : { ...current, title: titleFromFileName(selected.name) }))
  }

  const uploading = progress !== null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user || uploading) return

    const nextErrors: Errors = {}
    if (mode === 'file' && !file) nextErrors.file = 'Choose a file to upload.'
    if (mode === 'video' && !/^https?:\/\//.test(videoUrl.trim())) nextErrors.video = 'Paste a full YouTube or Google Drive link.'
    if (!values.title.trim()) nextErrors.title = 'Give the material a title.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setProgress(0)
    let uploadedKey: string | null = null
    try {
      let fileUrl: string | null = null
      if (mode === 'file' && file) {
        const upload = await uploadFileInGithubChunks(file, setProgress)
        uploadedKey = upload.key
        fileUrl = upload.publicUrl
      }
      const { data, error } = await createClient()
        .from('materials')
        .insert({
          title: values.title.trim(),
          description: values.description.trim() || null,
          file_url: fileUrl,
          file_key: uploadedKey,
          file_name: mode === 'file' ? file?.name ?? null : null,
          file_type: mode === 'file' && file ? getFileTypeFromName(file.name) : 'video',
          file_size_bytes: mode === 'file' ? file?.size ?? null : null,
          video_url: mode === 'video' ? videoUrl.trim() : null,
          subject_id: values.subjectId || null,
          lab_id: values.labId || null,
          tags: parseTags(values.tags),
          uploaded_by: user.id,
          sort_order: 0,
          is_hidden: false,
          download_count: 0,
        })
        .select('id')
        .single()
      if (error || !data) throw new Error(error?.message || 'Could not save the material')
      toast.success('Published to the library')
      router.replace(`/materials/${data.id}`)
    } catch (error) {
      if (uploadedKey) await fetch(`/api/upload/${uploadedKey}`, { method: 'DELETE' }).catch(() => undefined)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
      setProgress(null)
    }
  }

  const videoLooksValid = videoUrl.trim() && getVideoEmbedUrl(videoUrl.trim())

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7 pb-28 md:pb-0">
      <PageHeader title="Upload" backHref="/materials" meta="Shared with everyone in your class" />

      <div role="radiogroup" aria-label="What are you sharing?" className="grid grid-cols-2 gap-1 rounded-[12px] bg-surface-2 p-1">
        {(
          [
            { value: 'file', label: 'File', icon: FileArrowUpIcon },
            { value: 'video', label: 'Video link', icon: LinkIcon },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={mode === option.value}
            onClick={() => setMode(option.value)}
            className={cn(
              'flex h-10 items-center justify-center gap-2 rounded-[9px] text-sm font-medium transition-colors',
              mode === option.value ? 'bg-surface text-ink shadow-float' : 'text-muted'
            )}
          >
            <option.icon className="size-[18px]" /> {option.label}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <div className="space-y-1.5">
          {file ? (
            <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-3">
              <FileTile material={{ file_name: file.name, file_type: getFileTypeFromName(file.name), video_url: null }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{file.name}</p>
                <p className="text-sm text-muted">{formatBytes(file.size)}</p>
              </div>
              <IconButton label="Remove file" onClick={() => setFile(null)} disabled={uploading}>
                <XIcon className="size-5" />
              </IconButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                pickFile(event.dataTransfer.files?.[0])
              }}
              aria-describedby="file-help"
              className={cn(
                'pressable flex w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed bg-surface px-6 py-10 text-center',
                errors.file ? 'border-danger' : 'border-line-strong hover:border-accent'
              )}
            >
              <span className="flex size-12 items-center justify-center rounded-tile bg-accent-soft text-accent-soft-ink">
                <FileArrowUpIcon className="size-6" weight="duotone" />
              </span>
              <span className="text-[15px] font-medium">Choose a file</span>
              <span id="file-help" className="text-sm text-muted">
                PDF, DOCX, images, code or ZIP, up to {MAX_FILE_SIZE_LABEL}
              </span>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              pickFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          {errors.file && <p className="text-sm text-danger">{errors.file}</p>}
        </div>
      ) : (
        <Field
          label="Video link"
          error={errors.video}
          hint={videoUrl && !videoLooksValid ? "We can't preview this link, but it will still open." : 'YouTube or Google Drive'}
        >
          {(props) => (
            <input
              {...props}
              type="url"
              inputMode="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://youtu.be/..."
              autoCapitalize="none"
              autoCorrect="off"
              className="field"
            />
          )}
        </Field>
      )}

      <MaterialFields
        values={values}
        onChange={(patch) => {
          setValues((current) => ({ ...current, ...patch }))
          if (patch.title) setErrors((current) => ({ ...current, title: undefined }))
        }}
        subjects={subjects}
        labs={labs}
        titleError={errors.title}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/92 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto max-w-md space-y-2 md:mx-0">
          {uploading && mode === 'file' && (
            <div className="h-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          <Button type="submit" size="lg" className="w-full md:w-auto md:min-w-48" loading={uploading}>
            {uploading ? (mode === 'file' ? `Uploading ${progress}%` : 'Publishing') : 'Publish'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function MaterialUploadPage() {
  return (
    <Suspense>
      <UploadForm />
    </Suspense>
  )
}
