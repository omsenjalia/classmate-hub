import { useId } from 'react'

interface FieldProps {
  label: string
  hint?: string
  error?: string | null
  optional?: boolean
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode
}

/** Label + control + hint/error, wired up for screen readers. */
export default function Field({ label, hint, error, optional, children }: FieldProps) {
  const id = useId()
  const describedBy = error || hint ? `${id}-desc` : undefined
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-ink-2">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {(error || hint) && (
        <p id={describedBy} className={error ? 'text-sm text-danger' : 'text-xs text-muted'}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
