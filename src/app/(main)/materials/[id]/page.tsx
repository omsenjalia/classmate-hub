'use client'

import { use, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowSquareOutIcon,
  BookmarkSimpleIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
  EyeSlashIcon,
  FileDashedIcon,
  PencilSimpleIcon,
  PlayIcon,
  ShareNetworkIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useMaterialDetail } from '@/hooks/useMaterialDetail'
import { ALLOWED_FILE_EXTENSIONS } from '@/lib/constants'
import { displayName, formatBytes, formatDate, getFileKind, getFileKindLabel } from '@/lib/utils'
import PageHeader from '@/components/layout/PageHeader'
import { Button, ButtonLink, IconButton } from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Sheet from '@/components/ui/Sheet'
import Avatar from '@/components/ui/Avatar'
import FileTile from '@/components/materials/FileTile'
import MaterialPreview from '@/components/materials/MaterialPreview'
import EditMaterialForm from '@/components/materials/EditMaterialForm'
import VersionHistory from '@/components/materials/VersionHistory'

const VERSION_ACCEPT = ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')

function DetailSkeleton() {
  return (
    <div className="space-y-6 pt-16" aria-busy="true" aria-label="Loading material">
      <div className="flex gap-4">
        <div className="skeleton size-16 rounded-tile" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-6 w-4/5 rounded" />
          <div className="skeleton h-6 w-1/2 rounded" />
        </div>
      </div>
      <div className="skeleton h-28 rounded-card" />
      <div className="skeleton h-14 rounded-card" />
    </div>
  )
}

export default function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const subjects = useAppStore((state) => state.subjects)
  const versionInput = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [versionProgress, setVersionProgress] = useState<number | null>(null)

  const {
    material,
    loading,
    user,
    downloadCount,
    bookmarked,
    versions,
    labs,
    canManage,
    registerDownload,
    toggleBookmark,
    remove,
    saveMetadata,
    publishNewVersion,
  } = useMaterialDetail(id)

  if (loading) {
    return <DetailSkeleton />
  }

  if (!material) {
    return (
      <>
        <PageHeader backHref="/materials" />
        <EmptyState
          icon={FileDashedIcon}
          title="Material not found"
          description="It may have been removed, hidden by an admin, or the link is wrong."
          action={<ButtonLink href="/materials">Back to the library</ButtonLink>}
        />
      </>
    )
  }

  const kind = getFileKind(material)
  const isVideo = kind === 'video'
  const targetUrl = material.file_url || material.video_url

  const handleOpen = () => {
    if (!targetUrl) return
    registerDownload()
    window.open(targetUrl, '_blank', 'noopener')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: material.title, url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await navigator.clipboard?.writeText(url)
    toast.success('Link copied')
  }

  const handleBookmark = async () => {
    if (!user) {
      toast('Sign in to save materials')
      router.push('/login')
      return
    }
    const ok = await toggleBookmark()
    if (!ok) return toast.error('Could not update your saved list')
    toast.success(bookmarked ? 'Removed from saved' : 'Saved for later')
  }

  const handleDelete = async () => {
    setDeleting(true)
    const ok = await remove()
    setDeleting(false)
    if (!ok) return toast.error('Could not delete this material')
    toast.success('Material deleted')
    router.push('/materials')
  }

  const handleSave = async (draft: Parameters<typeof saveMetadata>[0]) => {
    setSaving(true)
    const ok = await saveMetadata(draft)
    setSaving(false)
    if (!ok) return toast.error('Could not save changes')
    setEditing(false)
    toast.success('Details updated')
  }

  const handleVersionFile = async (file: File) => {
    try {
      setVersionProgress(0)
      await publishNewVersion(file, setVersionProgress)
      toast.success('New version published')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not publish new version')
    } finally {
      setVersionProgress(null)
    }
  }

  const facts = [
    { label: 'Type', value: getFileKindLabel(kind) },
    material.file_size_bytes ? { label: 'Size', value: formatBytes(material.file_size_bytes) } : null,
    { label: 'Added', value: formatDate(material.created_at) },
    { label: isVideo ? 'Opens' : 'Downloads', value: downloadCount.toLocaleString() },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact))

  const primaryLabel = isVideo ? 'Watch' : kind === 'pdf' || kind === 'image' ? 'Open' : 'Download'
  const PrimaryIcon = isVideo ? PlayIcon : kind === 'pdf' || kind === 'image' ? ArrowSquareOutIcon : DownloadSimpleIcon

  return (
    <article className="space-y-7 pb-24 md:pb-0">
      <PageHeader
        backHref="/materials"
        actions={
          <>
            <IconButton label="Share" onClick={handleShare}>
              <ShareNetworkIcon className="size-[22px]" />
            </IconButton>
            <IconButton label={bookmarked ? 'Remove from saved' : 'Save for later'} active={bookmarked} onClick={handleBookmark} className="hidden md:inline-flex">
              <BookmarkSimpleIcon className="size-[22px]" weight={bookmarked ? 'fill' : 'regular'} />
            </IconButton>
          </>
        }
      />

      <div className="animate-rise -mt-4 space-y-4">
        <div className="flex items-start gap-4">
          <FileTile material={material} size="lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            {material.subjects ? (
              <Link
                href={`/subjects/${material.subjects.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <span className="font-mono font-medium">{material.subjects.code}</span>
                {material.labs && <span className="text-muted">/ {material.labs.name}</span>}
              </Link>
            ) : (
              <p className="text-sm text-muted">General material</p>
            )}
            <h1 className="text-[22px] font-semibold leading-snug md:text-[26px]">{material.title}</h1>
          </div>
        </div>

        {material.is_hidden && (
          <p className="flex items-center gap-2 rounded-tile bg-surface-2 px-3 py-2 text-sm text-ink-2">
            <EyeSlashIcon className="size-4" /> Hidden from classmates. Only you and admins can see it.
          </p>
        )}

        {material.description && (
          <p className="max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{material.description}</p>
        )}

        {material.tags && material.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {material.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/materials?q=${encodeURIComponent(tag)}`}
                  className="inline-flex h-7 items-center rounded-[8px] bg-surface-2 px-2.5 text-[13px] text-ink-2 hover:text-ink"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="bg-surface px-4 py-3">
            <dt className="text-xs text-muted">{fact.label}</dt>
            <dd className="mt-0.5 text-[15px] font-medium tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {/* Desktop action row; phones use the sticky bar below. */}
      {targetUrl && (
        <div className="hidden gap-3 md:flex">
          <Button size="lg" onClick={handleOpen}>
            <PrimaryIcon className="size-5" weight="bold" /> {primaryLabel}
          </Button>
        </div>
      )}

      <MaterialPreview material={material} />

      {material.profiles && (
        <Link
          href={`/profile/${material.profiles.username}`}
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 hover:border-line-strong"
        >
          <Avatar profile={material.profiles} />
          <span className="min-w-0 flex-1 text-sm">
            <span className="block text-muted">Shared by</span>
            <span className="block truncate font-medium">{displayName(material.profiles)}</span>
          </span>
          <CaretRightIcon className="size-4 text-muted" aria-hidden />
        </Link>
      )}

      <VersionHistory versions={versions} />

      {canManage && (
        <section aria-labelledby="manage-heading" className="space-y-3">
          <h2 id="manage-heading" className="text-sm font-semibold text-ink-2">
            Manage
          </h2>
          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <button type="button" onClick={() => setEditing(true)} className="flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left text-[15px] hover:bg-surface-2/60">
              <PencilSimpleIcon className="size-5 text-ink-2" /> Edit details
            </button>
            {material.file_url && (
              <button
                type="button"
                disabled={versionProgress !== null}
                onClick={() => versionInput.current?.click()}
                className="flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left text-[15px] hover:bg-surface-2/60 disabled:opacity-60"
              >
                <UploadSimpleIcon className="size-5 text-ink-2" />
                <span className="flex-1">{versionProgress === null ? 'Replace file with a newer version' : `Uploading new version, ${versionProgress}%`}</span>
              </button>
            )}
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] text-danger hover:bg-danger-soft/60">
              <TrashIcon className="size-5" /> Delete material
            </button>
          </div>
          <input
            ref={versionInput}
            type="file"
            accept={VERSION_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void handleVersionFile(file)
            }}
          />
        </section>
      )}

      {/* Phone action bar, thumb height, replaces the tab bar on this screen. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/92 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md gap-2.5">
          <button
            type="button"
            onClick={handleBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? 'Remove from saved' : 'Save for later'}
            className="pressable flex size-12 shrink-0 items-center justify-center rounded-tile border border-line bg-surface text-ink-2 aria-pressed:border-accent aria-pressed:text-accent"
          >
            <BookmarkSimpleIcon className="size-6" weight={bookmarked ? 'fill' : 'regular'} />
          </button>
          {targetUrl ? (
            <Button size="lg" className="flex-1" onClick={handleOpen}>
              <PrimaryIcon className="size-5" weight="bold" /> {primaryLabel}
              {material.file_size_bytes && !isVideo ? (
                <span className="font-normal opacity-75">{formatBytes(material.file_size_bytes)}</span>
              ) : null}
            </Button>
          ) : (
            <Button size="lg" className="flex-1" disabled>
              No file attached
            </Button>
          )}
        </div>
      </div>

      <Sheet open={editing} title="Edit details" onClose={() => setEditing(false)}>
        {editing && (
          <EditMaterialForm
            material={material}
            subjects={subjects}
            labs={labs}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        )}
      </Sheet>

      <Sheet
        open={confirmDelete}
        title="Delete this material?"
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-2">
          &ldquo;{material.title}&rdquo; and its stored file will be removed for everyone. This can&apos;t be undone.
        </p>
      </Sheet>
    </article>
  )
}
