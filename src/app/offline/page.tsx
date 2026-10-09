import Link from 'next/link'
import { WifiSlashIcon } from '@phosphor-icons/react/dist/ssr'

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex flex-col items-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-card bg-surface-2 text-muted">
          <WifiSlashIcon className="size-7" weight="duotone" />
        </span>
        <h1 className="text-xl font-semibold">You&apos;re offline</h1>
        <p className="mt-1.5 max-w-xs text-sm text-muted">Your connection dropped. Reconnect to load the library.</p>
        <Link href="/materials" className="mt-5 font-medium text-accent underline-offset-4 hover:underline">
          Try again
        </Link>
      </div>
    </main>
  )
}
