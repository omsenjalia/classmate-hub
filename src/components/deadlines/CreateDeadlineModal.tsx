'use client'

import { useState } from 'react'
import { DeadlineType, Subject } from '@/lib/types'
import Modal, { ModalActions } from '@/components/ui/Modal'
import FormField, { formControlClassName } from '@/components/ui/FormField'
import type { DeadlineDraft } from '@/hooks/useDeadlines'

interface CreateDeadlineModalProps {
  subjects: Subject[]
  onClose: () => void
  onSubmit: (draft: DeadlineDraft) => Promise<boolean>
}

export default function CreateDeadlineModal({ subjects, onClose, onSubmit }: CreateDeadlineModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [type, setType] = useState<DeadlineType>('assignment')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate || isSubmitting) return

    setIsSubmitting(true)
    const ok = await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      subject_id: subjectId || null,
      due_date: new Date(dueDate).toISOString(),
      type,
    })
    setIsSubmitting(false)

    if (ok) onClose()
  }

  return (
    <Modal title="Add Shared Deadline" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Title *">
          <input
            type="text"
            required
            placeholder="e.g. Basic Electrical Assignment 2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={formControlClassName}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Subject">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className={formControlClassName}
            >
              <option value="">General</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Deadline Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DeadlineType)}
              className={formControlClassName}
            >
              <option value="assignment">Assignment</option>
              <option value="lab">Lab Report</option>
              <option value="exam">Exam</option>
              <option value="project">Project</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>

        <FormField label="Due Date & Time *">
          <input
            type="datetime-local"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Description / Instructions">
          <textarea
            rows={3}
            placeholder="Submission instructions or guidelines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={formControlClassName}
          />
        </FormField>

        <ModalActions onCancel={onClose} submitLabel={isSubmitting ? 'Posting…' : 'Post Deadline'} />
      </form>
    </Modal>
  )
}
