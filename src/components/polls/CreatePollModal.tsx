'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal, { ModalActions } from '@/components/ui/Modal'
import FormField, { formControlClassName } from '@/components/ui/FormField'
import type { PollDraft } from '@/hooks/usePolls'

interface CreatePollModalProps {
  onClose: () => void
  onSubmit: (input: PollDraft) => Promise<boolean>
}

export default function CreatePollModal({ onClose, onSubmit }: CreatePollModalProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddOption = () => {
    if (options.length >= 6) {
      toast.error('Maximum 6 poll options allowed')
      return
    }
    setOptions([...options, ''])
  }

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options]
    updated[index] = val
    setOptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const ok = await onSubmit({
      question: question.trim(),
      options: options.map((o) => o.trim()).filter(Boolean),
      allow_multiple: allowMultiple,
      is_anonymous: isAnonymous,
    })
    setIsSubmitting(false)

    if (ok) onClose()
  }

  return (
    <Modal title="Create New Class Poll" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Poll Question *">
          <input
            type="text"
            required
            placeholder="e.g. Preferred time for Math-1 revision session?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Poll Options (At least 2)">
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className={formControlClassName}
              />
            ))}
          </div>
          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add another option
            </button>
          )}
        </FormField>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-indigo-600"
            />
            Allow multiple selections
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-indigo-600"
            />
            Anonymous voting
          </label>
        </div>

        <ModalActions onCancel={onClose} submitLabel={isSubmitting ? 'Publishing…' : 'Publish Poll'} />
      </form>
    </Modal>
  )
}
