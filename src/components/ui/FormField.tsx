'use client'

export const formLabelClassName =
  'block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1'

export const formControlClassName =
  'w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none'

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

/** Labeled form row using the app-wide mono-caps label style. */
export default function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <label className={formLabelClassName}>{label}</label>
      {children}
    </div>
  )
}
