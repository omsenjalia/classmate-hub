'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon, PackageIcon, TrashIcon } from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'
import { useAsyncData } from '@/hooks/useAsyncData'
import { matchesQuery } from '@/hooks/useMaterialFilters'
import { fetchLiveMaterials } from '@/lib/supabase-data'
import { createClient } from '@/lib/supabase/client'
import { deleteMaterial, moveItem, persistOrder } from '@/lib/material-actions'
import { cn, formatBytes } from '@/lib/utils'
import type { Material } from '@/lib/types'
import EmptyState from '@/components/ui/EmptyState'
import Sheet from '@/components/ui/Sheet'
import { Button, IconButton } from '@/components/ui/Button'
import FileTile from '@/components/materials/FileTile'
import { SearchField } from '@/components/materials/LibraryControls'
import { MaterialListSkeleton } from '@/components/materials/MaterialList'
import ReorderButtons from '@/components/admin/ReorderButtons'

function byClassOrder(a: Material, b: Material) {
  return a.sort_order - b.sort_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
}

export default function AdminMaterialsPage() {
  const { data, setData, isLoading } = useAsyncData(async () => (await fetchLiveMaterials()).sort(byClassOrder), [])
  const items = useMemo(() => data ?? [], [data])
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Material | null>(null)

  const visible = query ? items.filter((item) => matchesQuery(item, query)) : items
  const totalBytes = items.reduce((sum, item) => sum + (item.file_size_bytes || 0), 0)
  const hiddenCount = items.filter((item) => item.is_hidden).length

  const toggleHidden = async (item: Material) => {
    const next = !item.is_hidden
    setData((current) => current?.map((row) => (row.id === item.id ? { ...row, is_hidden: next } : row)) ?? null)
    const { error } = await createClient().from('materials').update({ is_hidden: next }).eq('id', item.id)
    if (error) {
      setData((current) => current?.map((row) => (row.id === item.id ? { ...row, is_hidden: !next } : row)) ?? null)
      return toast.error(error.message)
    }
    toast.success(next ? 'Hidden from students' : 'Visible again')
  }

  const move = async (from: number, to: number) => {
    const reordered = moveItem(items, from, to)
    const previous = items
    setData(reordered.map((row, index) => ({ ...row, sort_order: index + 1 })))
    setBusy(true)
    try {
      await persistOrder('materials', reordered)
    } catch (error) {
      setData(previous)
      toast.error(error instanceof Error ? error.message : 'Could not save the order')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setBusy(true)
    try {
      await deleteMaterial(pendingDelete)
      setData((current) => current?.filter((row) => row.id !== pendingDelete.id) ?? null)
      toast.success('Material deleted')
      setPendingDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-line bg-line text-center">
        {[
          { label: 'Materials', value: items.length.toLocaleString() },
          { label: 'Hidden', value: hiddenCount.toLocaleString() },
          { label: 'Stored', value: formatBytes(totalBytes) },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface px-2 py-3">
            <dt className="text-xs text-muted">{stat.label}</dt>
            <dd className="mt-0.5 text-[17px] font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center gap-2">
        {!reordering && <SearchField value={query} onChange={setQuery} placeholder="Find a material" />}
        {items.length > 1 && (
          <Button
            variant={reordering ? 'primary' : 'secondary'}
            className={cn('rounded-full', reordering && 'w-full')}
            onClick={() => {
              setQuery('')
              setReordering((value) => !value)
            }}
          >
            {reordering ? 'Done' : 'Reorder'}
          </Button>
        )}
      </div>
      {reordering && (
        <p className="text-sm text-muted">This sets the &ldquo;Class order&rdquo; sort students can pick in the library.</p>
      )}

      {isLoading ? (
        <MaterialListSkeleton rows={5} />
      ) : visible.length === 0 ? (
        <EmptyState icon={PackageIcon} title={query ? 'No matches' : 'No materials yet'} description={query ? undefined : 'Uploads from the class appear here.'} />
      ) : (
        <ul className="overflow-hidden rounded-card border border-line bg-surface">
          {visible.map((item) => {
            const index = items.indexOf(item)
            return (
              <li key={item.id} className={cn('flex items-center gap-2 border-b border-line py-2 pl-4 pr-1 last:border-0 sm:gap-3 sm:pl-3', item.is_hidden && 'bg-surface-2/50')}>
                <span className={cn('hidden sm:block', item.is_hidden && 'opacity-50')}>
                  <FileTile material={item} />
                </span>
                <Link href={`/materials/${item.id}`} className="min-w-0 flex-1">
                  <span className={cn('block truncate text-[15px] font-medium', item.is_hidden && 'text-muted line-through decoration-1')}>
                    {item.title}
                  </span>
                  <span className="block truncate text-[13px] text-muted">
                    <span className="font-mono">{item.subjects?.code || 'General'}</span>, {item.download_count} downloads
                  </span>
                </Link>
                {reordering ? (
                  <ReorderButtons label={item.title} index={index} count={items.length} disabled={busy} onMove={move} />
                ) : (
                  <>
                    <IconButton label={item.is_hidden ? 'Show to students' : 'Hide from students'} onClick={() => toggleHidden(item)} active={item.is_hidden}>
                      {item.is_hidden ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                    </IconButton>
                    <IconButton label="Delete" onClick={() => setPendingDelete(item)} className="text-danger">
                      <TrashIcon className="size-5" />
                    </IconButton>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <Sheet
        open={!!pendingDelete}
        title="Delete this material?"
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <Button variant="ghost" className="flex-1" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
            <Button variant="danger" className="flex-1" onClick={confirmDelete} loading={busy}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-2">
          &ldquo;{pendingDelete?.title}&rdquo; and its stored file will be removed for everyone. Hiding it is reversible if you&apos;re unsure.
        </p>
      </Sheet>
    </div>
  )
}
