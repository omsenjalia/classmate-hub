import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react/dist/ssr'

interface ReorderButtonsProps {
  label: string
  index: number
  count: number
  disabled?: boolean
  onMove: (from: number, to: number) => void
}

/** Up/down controls; easier to hit on a phone than drag handles. */
export default function ReorderButtons({ label, index, count, disabled, onMove }: ReorderButtonsProps) {
  const base =
    'flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 disabled:opacity-30'
  return (
    <span className="flex shrink-0">
      <button
        type="button"
        className={base}
        aria-label={`Move ${label} up`}
        disabled={disabled || index === 0}
        onClick={() => onMove(index, index - 1)}
      >
        <ArrowUpIcon className="size-4" />
      </button>
      <button
        type="button"
        className={base}
        aria-label={`Move ${label} down`}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(index, index + 1)}
      >
        <ArrowDownIcon className="size-4" />
      </button>
    </span>
  )
}
