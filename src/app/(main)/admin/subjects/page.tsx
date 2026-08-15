'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Subject, Lab } from '@/lib/types'
import { MOCK_LABS } from '@/lib/mock-data'
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
import { Plus, GripVertical, BookOpen, FlaskConical, Trash2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function SortableSubjectItem({
  subject,
  labs,
  onAddLab,
  onDeleteSubject,
}: {
  subject: Subject
  labs: Lab[]
  onAddLab: (subjectId: string) => void
  onDeleteSubject: (subjectId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subject.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#1A1D27] border border-[#2D3148] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[#8B91A8] hover:text-white p-1 rounded hover:bg-[#242736]"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-[#4F6EF7]/20 border border-[#4F6EF7]/40 flex items-center justify-center font-mono font-bold text-xs text-[#4F6EF7]">
            {subject.code}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">{subject.name}</h3>
            <p className="text-[11px] text-[#8B91A8] font-mono">Semester {subject.semester}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddLab(subject.id)}
            className="text-xs bg-[#242736] hover:bg-[#2D3148] border border-[#2D3148] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#4F6EF7]" /> Add Lab
          </button>
          <button
            onClick={() => onDeleteSubject(subject.id)}
            className="text-xs text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="Delete Subject"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Labs List */}
      {labs.length > 0 && (
        <div className="pl-10 space-y-2 border-t border-[#2D3148] pt-3">
          <p className="text-[10px] font-mono font-semibold uppercase text-[#8B91A8] flex items-center gap-1.5">
            <FlaskConical className="w-3 h-3 text-emerald-400" /> Associated Experiment Labs ({labs.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-1.5 text-xs text-[#E8EAF0] flex items-center justify-between"
              >
                <span className="truncate">{lab.name}</span>
                <span className="text-[10px] font-mono text-[#8B91A8]">Lab #{lab.sort_order}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminSubjectsPage() {
  const { subjects, setSubjects, channels, setChannels } = useAppStore()
  const [labs, setLabs] = useState<Lab[]>(MOCK_LABS)

  // Subject Form State
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [semester, setSemester] = useState(1)

  // Lab Modal State
  const [activeSubjectForLab, setActiveSubjectForLab] = useState<string | null>(null)
  const [labName, setLabName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = subjects.findIndex((s) => s.id === active.id)
      const newIndex = subjects.findIndex((s) => s.id === over.id)
      const newOrder = arrayMove(subjects, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sort_order: idx + 1,
      }))
      setSubjects(newOrder)
      toast.success('Subject order updated')
    }
  }

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) {
      toast.error('Please enter subject name and code')
      return
    }

    const newSub: Subject = {
      id: 'sub-' + Date.now(),
      name,
      code: code.toUpperCase().trim(),
      semester,
      sort_order: subjects.length + 1,
      created_at: new Date().toISOString(),
    }

    // Auto-create chat channel as required by DB trigger spec
    const newChan = {
      id: `chan-${code.toLowerCase()}`,
      name: code.toLowerCase(),
      description: `${name} subject discussion`,
      subject_id: newSub.id,
      is_default: false,
      created_at: new Date().toISOString(),
    }

    setSubjects([...subjects, newSub])
    setChannels([...channels, newChan])
    setName('')
    setCode('')
    toast.success(`Subject "${newSub.code}" & auto-created chat channel added!`)
  }

  const handleAddLab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!labName || !activeSubjectForLab) return

    const subjectLabs = labs.filter((l) => l.subject_id === activeSubjectForLab)
    const newLab: Lab = {
      id: 'lab-' + Date.now(),
      subject_id: activeSubjectForLab,
      name: labName.trim(),
      sort_order: subjectLabs.length + 1,
      created_at: new Date().toISOString(),
    }

    setLabs([...labs, newLab])
    setLabName('')
    setActiveSubjectForLab(null)
    toast.success('New lab manual added!')
  }

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id))
    toast.success('Subject removed')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#4F6EF7]" /> Subject & Lab Management
        </h1>
        <p className="text-sm text-[#8B91A8] mt-1">
          Add semester courses, organize lab practical manuals, and drag to customize display order.
        </p>
      </div>

      {/* Add Subject Form */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold font-display text-white">Add New Subject</h2>
        <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. 119ES"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-2 text-xs text-white uppercase focus:border-[#4F6EF7] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Fundamentals of Programming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-[#4F6EF7]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Save Subject & Auto-Create Channel
            </button>
          </div>
        </form>
      </div>

      {/* Sortable Subject List */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-semibold uppercase text-[#8B91A8]">
          Current Subjects (Drag handles to reorder)
        </h2>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={subjects.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {subjects.map((subject) => (
                <SortableSubjectItem
                  key={subject.id}
                  subject={subject}
                  labs={labs.filter((l) => l.subject_id === subject.id)}
                  onAddLab={(subId) => setActiveSubjectForLab(subId)}
                  onDeleteSubject={handleDeleteSubject}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Add Lab Modal */}
      {activeSubjectForLab && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D27] border border-[#2D3148] rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold font-display text-white">Add Lab Practical Guide</h3>
            <form onSubmit={handleAddLab} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">Lab Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab 4 — Arrays & Strings"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubjectForLab(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#8B91A8] hover:text-white bg-[#242736]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-[#4F6EF7] hover:bg-[#3B55D4] flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Save Lab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
