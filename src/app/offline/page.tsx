import Link from 'next/link'

export default function OfflinePage() {
  return <main className="min-h-screen grid place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold">You&apos;re offline</h1><p className="text-muted mt-2">Reconnect to refresh ClassmateHub.</p><Link href="/dashboard" className="inline-block mt-5 text-indigo-500 underline">Try again</Link></div></main>
}
