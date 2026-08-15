'use client'

import { useState } from 'react'
import { MOCK_MATERIALS } from '@/lib/mock-data'
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
  HardDrive,
  FolderKanban,
  FileText,
  Video,
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
      className={`bg-[#1A1D27] border rounded-xl p-4 flex items-center justify-between gap-4 transition-all ${
        item.is_hidden ? 'opacity-60 border-red-500/20 bg-red-500/5' : 'border-[#2D3148]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#8B91A8] hover:text-white p-1 rounded hover:bg-[#242736]"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-lg bg-[#0F1117] border border-[#2D3148] flex items-center justify-center shrink-0">
          {item.video_url ? (
            <Video className="w-4 h-4 text-[#4F6EF7]" />
          ) : (
            <FileText className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-white truncate font-display">{item.title}</h3>
            {item.is_hidden && (
              <span className="text-[9px] bg-red-500/20 text-red-400 font-mono px-1.5 py-0.5 rounded">
                HIDDEN
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#8B91A8] font-mono truncate">
            Subject: {item.subjects?.code || 'General'} • Downloads: {item.download_count} • Size:{' '}
            {formatBytes(item.file_size_bytes)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggleHide(item.id)}
          className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            item.is_hidden
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-[#242736] text-[#8B91A8] hover:text-white border-[#2D3148]'
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
  const [items, setItems] = useState<Material[]>(MOCK_MATERIALS)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const totalBytesUsed = items.reduce((acc, curr) => acc + (curr.file_size_bytes || 0), 0)
  const freeTierLimitBytes = 10 * 1024 * 1024 * 1024 // 10GB Cloudflare R2 Free Tier
  const usedPercentage = Math.min(100, Math.max(1, (totalBytesUsed / freeTierLimitBytes) * 100))

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
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-amber-400" /> Admin Materials & Storage Dashboard
        </h1>
        <p className="text-sm text-[#8B91A8] mt-1">
          Control custom sort ordering, toggle material visibility, and monitor Cloudflare R2 storage usage.
        </p>
      </div>

      {/* StorageUsageBar Component */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-white font-bold">
            <HardDrive className="w-4 h-4 text-[#4F6EF7]" /> Cloudflare R2 Storage Monitor
          </div>
          <span className="text-[#8B91A8]">
            {formatBytes(totalBytesUsed)} used / 10.0 GB Free Tier
          </span>
        </div>

        <div className="h-3 w-full bg-[#0F1117] rounded-full overflow-hidden border border-[#2D3148]">
          <div
            className="h-full bg-gradient-to-r from-[#4F6EF7] to-emerald-400 transition-all duration-300"
            style={{ width: `${usedPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8B91A8] font-mono">
          <span>0 GB</span>
          <span>{usedPercentage.toFixed(2)}% used</span>
          <span>10 GB Cap</span>
        </div>
      </div>

      {/* Sortable Materials List */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase text-[#8B91A8]">
          All Uploaded Materials ({items.length})
        </h2>

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
      </div>
    </div>
  )
}
