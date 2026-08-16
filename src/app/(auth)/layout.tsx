import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(225,20%,7%)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(228,18%,80%)_1px,transparent_1px)] dark:bg-[radial-gradient(hsl(228,18%,22%)_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-[hsl(225,20%,7%)] border border-gray-200 dark:border-[hsl(228,18%,22%)] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="BVM Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">ClassmateHub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">BVM IT Department</p>
          </div>
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px] z-10">
        {children}
      </div>
    </div>
  )
}
