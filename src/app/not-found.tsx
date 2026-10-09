import { FileDashedIcon } from '@phosphor-icons/react/dist/ssr'
import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex flex-col items-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-card bg-surface-2 text-muted">
          <FileDashedIcon className="size-7" weight="duotone" />
        </span>
        <h1 className="text-xl font-semibold">This page isn&apos;t here</h1>
        <p className="mt-1.5 max-w-xs text-sm text-muted">The link may be old. Everything lives in the library now.</p>
        <ButtonLink href="/materials" className="mt-5">
          Open the library
        </ButtonLink>
      </div>
    </main>
  )
}
