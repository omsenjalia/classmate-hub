'use client'

import { useState } from 'react'
import { Loader2, Save, X } from 'lucide-react'
import { Lab, Material, Subject } from '@/lib/types'
import type { MaterialDraft } from '@/hooks/useMaterialDetail'

interface EditMaterialFormProps {
  material: Material
  subjects: Subject[]
  availableLabs: Lab[]
  saving: boolean
  onSave: (draft: MaterialDraft) => void
  onClose: () => void
}

/** Inline metadata editor shown when the owner/admin clicks the pencil. */
export default function EditMaterialForm({
  material,
  subjects,
  availableLabs,
  saving,
  onSave,
  onClose,
}: EditMaterialFormProps) {
  const [title, setTitle] = useState(material.title || '')
  const [description, setDescription] = useState(material.description || '')
  const [subjectId, setSubjectId] = useState(material.subject_id || '')
  const [labId, setLabId] = useState(material.lab_id || '')
  const [tagsInput, setTagsInput] = useState(material.tags?.join(', ') || '')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      subject_id: subjectId || null,
      lab_id: labId || null,
      tags: tags.length ? tags : null,
    })
  }

  const editorControlClassName =
    'bg-page border border-border rounded-xl px-3 py-2.5 text-sm text-primary'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-lg"
      aria-label="Edit material details"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-primary">Edit material details</h2>
          <p className="text-xs text-muted mt-1">Only the owner or an administrator can make changes.</p>
        </div>
        <button type="button" onClick={onClose} className="p-2 text-muted hover:text-primary" aria-label="Close editor">
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Material title"
        className={`w-full ${editorControlClassName}`}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <select
          value={subjectId}
          onChange={(event) => {
            setSubjectId(event.target.value)
            setLabId('')
          }}
          className={editorControlClassName}
        >
          <option value="">General material</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code} — {subject.name}
            </option>
          ))}
        </select>

        <select
          value={labId}
          onChange={(event) => setLabId(event.target.value)}
          disabled={!availableLabs.length}
          className={editorControlClassName}
        >
          <option value="">Lecture / general notes</option>
          {availableLabs.map((lab) => (
            <option key={lab.id} value={lab.id}>
              {lab.name}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        rows={3}
        className={`w-full ${editorControlClassName}`}
      />

      <input
        value={tagsInput}
        onChange={(event) => setTagsInput(event.target.value)}
        placeholder="Tags, comma separated"
        className={`w-full ${editorControlClassName}`}
      />

      <button
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : <Save className="w-4 h-4 inline mr-2" />}
        Save changes
      </button>
    </form>
  )
}
