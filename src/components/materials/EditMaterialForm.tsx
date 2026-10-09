'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import MaterialFields, { type MaterialFieldValues } from '@/components/materials/MaterialFields'
import { parseTags } from '@/lib/utils'
import type { Lab, Material, Subject } from '@/lib/types'
import type { MaterialDraft } from '@/hooks/useMaterialDetail'

interface EditMaterialFormProps {
  material: Material
  subjects: Subject[]
  labs: Lab[]
  saving: boolean
  onSave: (draft: MaterialDraft) => void
  onCancel: () => void
}

/** Metadata editor rendered inside the edit sheet. */
export default function EditMaterialForm({ material, subjects, labs, saving, onSave, onCancel }: EditMaterialFormProps) {
  const [values, setValues] = useState<MaterialFieldValues>({
    title: material.title || '',
    subjectId: material.subject_id || '',
    labId: material.lab_id || '',
    description: material.description || '',
    tags: material.tags?.join(', ') || '',
  })
  const [titleError, setTitleError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!values.title.trim()) {
      setTitleError('Give the material a title.')
      return
    }
    onSave({
      title: values.title.trim(),
      description: values.description.trim() || null,
      subject_id: values.subjectId || null,
      lab_id: values.labId || null,
      tags: parseTags(values.tags),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Edit material details">
      <MaterialFields
        values={values}
        onChange={(patch) => {
          setValues((current) => ({ ...current, ...patch }))
          if (patch.title) setTitleError(null)
        }}
        subjects={subjects}
        labs={labs}
        titleError={titleError}
      />
      <div className="flex gap-3">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={saving}>
          Save changes
        </Button>
      </div>
    </form>
  )
}
