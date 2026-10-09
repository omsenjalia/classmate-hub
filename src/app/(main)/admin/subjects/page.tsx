'use client'

import { useState } from 'react'
import { FlaskIcon, PlusIcon, SquaresFourIcon, TrashIcon } from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchLiveLabs } from '@/lib/supabase-data'
import { createClient } from '@/lib/supabase/client'
import { moveItem, persistOrder } from '@/lib/material-actions'
import type { Lab, Subject } from '@/lib/types'
import { Button, IconButton } from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Sheet from '@/components/ui/Sheet'
import ReorderButtons from '@/components/admin/ReorderButtons'

type Pending = { kind: 'subject'; item: Subject } | { kind: 'lab'; item: Lab }

export default function AdminSubjectsPage() {
  const { subjects, setSubjects } = useAppStore()
  const { data: labData, setData: setLabs } = useAsyncData(fetchLiveLabs, [])
  const labs = labData ?? []

  const [addOpen, setAddOpen] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [semester, setSemester] = useState('1')
  const [labDrafts, setLabDrafts] = useState<Record<string, string>>({})
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)

  const addSubject = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!code.trim() || !name.trim()) return toast.error('Add a code and a name')
    setBusy(true)
    const { data, error } = await createClient()
      .from('subjects')
      .insert({ code: code.trim().toUpperCase(), name: name.trim(), semester: Number(semester), sort_order: subjects.length + 1 })
      .select('*')
      .single()
    setBusy(false)
    if (error || !data) return toast.error(error?.message || 'Could not add subject')
    setSubjects([...subjects, data as Subject])
    setCode('')
    setName('')
    setAddOpen(false)
    toast.success(`${(data as Subject).code} added`)
  }

  const addLab = async (subjectId: string) => {
    const labName = labDrafts[subjectId]?.trim()
    if (!labName) return
    const count = labs.filter((lab) => lab.subject_id === subjectId).length
    const { data, error } = await createClient()
      .from('labs')
      .insert({ subject_id: subjectId, name: labName, sort_order: count + 1 })
      .select('*')
      .single()
    if (error || !data) return toast.error(error?.message || 'Could not add section')
    setLabs([...labs, data as Lab])
    setLabDrafts((current) => ({ ...current, [subjectId]: '' }))
  }

  const moveSubject = async (from: number, to: number) => {
    const previous = subjects
    const reordered = moveItem(subjects, from, to)
    setSubjects(reordered.map((subject, index) => ({ ...subject, sort_order: index + 1 })))
    try {
      await persistOrder('subjects', reordered)
    } catch (error) {
      setSubjects(previous)
      toast.error(error instanceof Error ? error.message : 'Could not save the order')
    }
  }

  const confirmDelete = async () => {
    if (!pending) return
    setBusy(true)
    const table = pending.kind === 'subject' ? 'subjects' : 'labs'
    const { error } = await createClient().from(table).delete().eq('id', pending.item.id)
    setBusy(false)
    if (error) return toast.error(error.message)
    if (pending.kind === 'subject') {
      setSubjects(subjects.filter((subject) => subject.id !== pending.item.id))
      setLabs(labs.filter((lab) => lab.subject_id !== pending.item.id))
    } else {
      setLabs(labs.filter((lab) => lab.id !== pending.item.id))
    }
    toast.success('Deleted')
    setPending(null)
  }

  return (
    <div className="space-y-4">
      <Button variant="secondary" className="w-full" onClick={() => setAddOpen(true)}>
        <PlusIcon className="size-5" /> Add subject
      </Button>

      {subjects.length === 0 ? (
        <EmptyState icon={SquaresFourIcon} title="No subjects yet" description="Add the courses for this semester so students can file materials under them." />
      ) : (
        <ul className="space-y-3">
          {subjects.map((subject, index) => {
            const subjectLabs = labs.filter((lab) => lab.subject_id === subject.id)
            return (
              <li key={subject.id} className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="flex items-center gap-2 py-2 pl-4 pr-1">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[13px] font-semibold text-accent">{subject.code}</p>
                    <p className="truncate text-[15px] font-medium">{subject.name}</p>
                    <p className="text-[13px] text-muted">Semester {subject.semester}</p>
                  </div>
                  <ReorderButtons label={subject.code} index={index} count={subjects.length} onMove={moveSubject} />
                  <IconButton label={`Delete ${subject.code}`} className="text-danger" onClick={() => setPending({ kind: 'subject', item: subject })}>
                    <TrashIcon className="size-5" />
                  </IconButton>
                </div>
                <div className="space-y-1 border-t border-line bg-surface-2/40 px-4 py-3">
                  {subjectLabs.map((lab) => (
                    <div key={lab.id} className="-mr-3 flex items-center gap-2.5 text-sm">
                      <FlaskIcon className="size-4 shrink-0 text-muted" />
                      <span className="flex-1 truncate">{lab.name}</span>
                      <IconButton label={`Delete ${lab.name}`} className="size-9 text-muted" onClick={() => setPending({ kind: 'lab', item: lab })}>
                        <TrashIcon className="size-4" />
                      </IconButton>
                    </div>
                  ))}
                  <form
                    className="flex gap-2 pt-1"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void addLab(subject.id)
                    }}
                  >
                    <input
                      value={labDrafts[subject.id] || ''}
                      onChange={(event) => setLabDrafts((current) => ({ ...current, [subject.id]: event.target.value }))}
                      placeholder="New lab section, e.g. Lab 4: Arrays"
                      aria-label={`New lab section for ${subject.code}`}
                      className="field h-10 min-h-0 py-2"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="h-10" disabled={!labDrafts[subject.id]?.trim()}>
                      Add
                    </Button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Sheet open={addOpen} title="Add subject" onClose={() => setAddOpen(false)}>
        <form onSubmit={addSubject} className="space-y-5">
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <Field label="Code">
              {(props) => <input {...props} value={code} onChange={(e) => setCode(e.target.value)} placeholder="119ES" autoCapitalize="characters" className="field font-mono uppercase" />}
            </Field>
            <Field label="Semester">
              {(props) => (
                <select {...props} value={semester} onChange={(e) => setSemester(e.target.value)} className="field">
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Semester {i + 1}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <Field label="Name">
            {(props) => <input {...props} value={name} onChange={(e) => setName(e.target.value)} placeholder="Fundamentals of Programming" className="field" />}
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={busy}>
            Add subject
          </Button>
        </form>
      </Sheet>

      <Sheet
        open={!!pending}
        title={pending?.kind === 'subject' ? `Delete ${pending.item.code}?` : 'Delete this section?'}
        onClose={() => setPending(null)}
        footer={
          <>
            <Button variant="ghost" className="flex-1" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={confirmDelete} loading={busy}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-2">
          Materials filed here stay in the library, but they will lose this {pending?.kind === 'subject' ? 'subject' : 'section'} label.
        </p>
      </Sheet>
    </div>
  )
}
