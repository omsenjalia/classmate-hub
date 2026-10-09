'use client'

import Field from '@/components/ui/Field'
import type { Lab, Subject } from '@/lib/types'

export interface MaterialFieldValues {
  title: string
  subjectId: string
  labId: string
  description: string
  tags: string
}

interface MaterialFieldsProps {
  values: MaterialFieldValues
  onChange: (patch: Partial<MaterialFieldValues>) => void
  subjects: Subject[]
  labs: Lab[]
  titleError?: string | null
}

/** Title, subject, section, description and tags, shared by upload and edit. */
export default function MaterialFields({ values, onChange, subjects, labs, titleError }: MaterialFieldsProps) {
  const subjectLabs = labs.filter((lab) => lab.subject_id === values.subjectId)

  return (
    <div className="space-y-5">
      <Field label="Title" error={titleError}>
        {(props) => (
          <input
            {...props}
            value={values.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="e.g. Unit 3 notes: pointers and arrays"
            autoComplete="off"
            className="field"
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Subject">
          {(props) => (
            <select
              {...props}
              value={values.subjectId}
              onChange={(event) => onChange({ subjectId: event.target.value, labId: '' })}
              className="field"
            >
              <option value="">General (no subject)</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} {subject.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Section" hint={values.subjectId && !subjectLabs.length ? 'This subject has no lab sections yet.' : undefined}>
          {(props) => (
            <select
              {...props}
              value={values.labId}
              onChange={(event) => onChange({ labId: event.target.value })}
              disabled={!subjectLabs.length}
              className="field"
            >
              <option value="">Lecture notes</option>
              {subjectLabs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field label="Description" optional>
        {(props) => (
          <textarea
            {...props}
            value={values.description}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="What's inside, which topics it covers"
            rows={3}
            className="field resize-y"
          />
        )}
      </Field>

      <Field label="Tags" optional hint="Separate with commas, e.g. midsem, recursion">
        {(props) => (
          <input
            {...props}
            value={values.tags}
            onChange={(event) => onChange({ tags: event.target.value })}
            placeholder="midsem, recursion"
            autoCapitalize="none"
            autoComplete="off"
            className="field"
          />
        )}
      </Field>
    </div>
  )
}
