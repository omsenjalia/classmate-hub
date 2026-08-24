'use client'

import { useState } from 'react'
import { EventType } from '@/lib/types'
import Modal, { ModalActions } from '@/components/ui/Modal'
import FormField, { formControlClassName } from '@/components/ui/FormField'

interface CreateEventModalProps {
  subjects: Array<{ id: string; code: string; name: string }>
  onClose: () => void
  onSubmit: (input: {
    title: string
    description: string | null
    type: EventType
    location: string | null
    start_time: string
    max_attendees: number | null
    subject_id: string | null
  }) => Promise<boolean>
}

export default function CreateEventModal({ subjects, onClose, onSubmit }: CreateEventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<EventType>('study_session')
  const [location, setLocation] = useState('')
  const [startTime, setStartTime] = useState('')
  const [maxAttendees, setMaxAttendees] = useState<string>('')
  const [subjectId, setSubjectId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startTime || isSubmitting) return

    setIsSubmitting(true)
    const ok = await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      type,
      location: location.trim() || 'BVM IT Department',
      start_time: new Date(startTime).toISOString(),
      max_attendees: maxAttendees ? Number(maxAttendees) : null,
      subject_id: subjectId || null,
    })
    setIsSubmitting(false)

    if (ok) onClose()
  }

  return (
    <Modal title="Schedule Class Event" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Event Title *">
          <input
            type="text"
            required
            placeholder="e.g. Mathematics Mid-Term Revision Session"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={formControlClassName}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Event Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className={formControlClassName}
            >
              <option value="study_session">Study Session</option>
              <option value="workshop">Workshop</option>
              <option value="activity">Class Activity</option>
              <option value="exam_prep">Exam Prep</option>
            </select>
          </FormField>

          <FormField label="Date & Time *">
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={formControlClassName}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Subject">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className={formControlClassName}
            >
              <option value="">General event</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} — {subject.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Capacity (optional)">
            <input
              type="number"
              min="1"
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              placeholder="Unlimited"
              className={formControlClassName}
            />
          </FormField>
        </div>

        <FormField label="Location / Link">
          <input
            type="text"
            placeholder="e.g. BVM IT Lab 204 or Google Meet link"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            rows={3}
            placeholder="Details about what will be covered..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={formControlClassName}
          />
        </FormField>

        <ModalActions onCancel={onClose} submitLabel={isSubmitting ? 'Scheduling…' : 'Schedule Event'} />
      </form>
    </Modal>
  )
}
