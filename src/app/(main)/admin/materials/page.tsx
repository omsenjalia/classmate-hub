'use client'

import { useState } from 'react'
import { Material } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  GitBranch,
  FolderKanban,
  FileText,
  Video,
  PackageOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'

function SortableAdminMaterialRow({
  item,
  onToggleHide,
  onDelete,
}: {
  item: Material
  onToggleHide: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-xl p-4 flex items-center justify-between gap-4 transition-all ${item.is_hidden ? 'opacity-60 border-red-500/20 bg-red-500/5' : 'border-border'
        }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-primary p-1 rounded hover:bg-elevated"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-lg bg-page border border-border flex items-center justify-center shrink-0">
          {item.video_url ? (
            <Video className="w-4 h-4 text-indigo-500" />
          ) : (
            <FileText className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-primary truncate font-display">{item.title}</h3>
            {item.is_hidden && (
              <span className="text-[9px] bg-red-500/20 text-red-400 font-mono px-1.5 py-0.5 rounded">
                HIDDEN
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted font-mono truncate">
            Subject: {item.subjects?.code || 'General'} • Downloads: {item.download_count} • Size:{' '}
            {formatBytes(item.file_size_bytes)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggleHide(item.id)}
          className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${item.is_hidden
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-elevated text-muted hover:text-primary border-border'
            }`}
          title={item.is_hidden ? 'Unhide Material' : 'Hide Material'}
        >
          {item.is_hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors cursor-pointer"
          title="Delete Material"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function AdminMaterialsPage() {
  const [items, setItems] = useState<Material[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const totalBytesUsed = items.reduce((acc, curr) => acc + (curr.file_size_bytes || 0), 0)
  const freeTierLimitBytes = 100 * 1024 * 1024 * 1024 // 100GB GitHub Storage Soft Limit
  const usedPercentage = Math.min(100, Math.max(0, (totalBytesUsed / freeTierLimitBytes) * 100))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      const updated = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sort_order: idx + 1,
      }))
      setItems(updated)
      toast.success('Admin material order updated!')
    }
  }

  const handleToggleHide = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_hidden: !i.is_hidden } : i))
    )
    toast.success('Material visibility toggled')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast.success('Material removed')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-amber-400" /> Admin Materials &amp; Storage Dashboard
        </h1>
        <p className="text-sm text-muted mt-1">
          Control custom sort ordering, toggle material visibility, and monitor GitHub Storage Engine.
        </p>
      </div>

      {/* GitHub Storage Usage Bar */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-primary font-bold">
            <GitBranch className="w-4 h-4 text-indigo-500" /> Private GitHub Storage Engine (omsenjalia/classmate-hub-storage)
          </div>
          <span className="text-muted">
            {formatBytes(totalBytesUsed)} used / 100.0 GB Capacity
          </span>
        </div>

        <div className="h-3 w-full bg-page rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${usedPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted font-mono">
          <span>0 GB</span>
          <span>Automatic chunking (&gt;99MB) enabled</span>
          <span>100 GB Limit</span>
        </div>
      </div>

      {/* Sortable Materials List */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase text-muted">
          All Uploaded Materials ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mx-auto">
              <PackageOpen className="w-6 h-6 text-muted" />
            </div>
            <h3 className="text-sm font-semibold text-primary">No materials uploaded yet</h3>
            <p className="text-xs text-muted">
              Materials uploaded via the Upload page will appear here for management.
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((item) => (
                  <SortableAdminMaterialRow
                    key={item.id}
                    item={item}
                    onToggleHide={handleToggleHide}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
