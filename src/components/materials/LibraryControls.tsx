'use client'

import { MagnifyingGlassIcon, SlidersHorizontalIcon, XCircleIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchField({ value, onChange, placeholder = 'Search titles, topics, tags' }: SearchFieldProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <MagnifyingGlassIcon
        className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search materials"
        className="field h-11 min-h-0 rounded-full bg-surface pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink"
        >
          <XCircleIcon className="size-[18px]" weight="fill" />
        </button>
      )}
    </div>
  )
}

export function FilterButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count ? `Filters, ${count} active` : 'Filters'}
      className={cn(
        'pressable relative flex size-11 shrink-0 items-center justify-center rounded-full border',
        count ? 'border-accent bg-accent-soft text-accent-soft-ink' : 'border-line bg-surface text-ink-2'
      )}
    >
      <SlidersHorizontalIcon className="size-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
          {count}
        </span>
      )}
    </button>
  )
}

interface ChipOption {
  value: string
  label: string
  title?: string
}

interface ChipRowProps {
  label: string
  options: ChipOption[]
  value: string
  onChange: (value: string) => void
  /** Wrap onto multiple lines instead of scrolling sideways. */
  wrap?: boolean
  mono?: boolean
}

/** Single-select chips. Scrolls edge to edge on phones. */
export function ChipRow({ label, options, value, onChange, wrap, mono }: ChipRowProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'flex gap-2',
        wrap ? 'flex-wrap' : 'no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0'
      )}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value || 'all'}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              'pressable h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium',
              mono && option.value && 'font-mono text-[13px]',
              selected
                ? 'border-ink bg-ink text-bg'
                : 'border-line bg-surface text-ink-2 hover:border-line-strong'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
