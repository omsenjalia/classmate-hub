'use client'

import { useEffect, useId, useRef } from 'react'
import { XIcon } from '@phosphor-icons/react/dist/ssr'
import { IconButton } from '@/components/ui/Button'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Bottom sheet on phones, centered dialog from md up. Built on <dialog> so
 * focus trapping, Escape and the backdrop come from the browser.
 */
export default function Sheet({ open, title, onClose, children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-black/45 backdrop:backdrop-blur-[2px] md:m-auto md:max-w-md"
    >
      {open && (
        <div className="animate-sheet flex max-h-[88dvh] flex-col rounded-t-sheet bg-surface pb-[env(safe-area-inset-bottom)] md:animate-rise md:rounded-sheet md:pb-0">
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong md:hidden" aria-hidden />
          <div className="flex items-center justify-between gap-2 py-1.5 pl-5 pr-2">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <IconButton label="Close" onClick={onClose}>
              <XIcon className="size-5" />
            </IconButton>
          </div>
          <div className="overflow-y-auto px-5 pb-5">{children}</div>
          {footer && <div className="flex gap-3 border-t border-line px-5 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
