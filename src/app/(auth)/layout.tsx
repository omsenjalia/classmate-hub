import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#2D3148_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4F6EF7]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-[#0F1117] border border-[#2D3148] flex items-center justify-center p-1.5 shadow-lg shadow-black/40 group-hover:scale-105 transition-transform overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="BVM Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold font-display tracking-tight text-white">ClassmateHub</h1>
            <p className="text-xs text-[#8B91A8] font-mono">BVM IT Department • Sem 1</p>
          </div>
        </Link>
      </div>

      {/* Card Content */}
      <div className="w-full max-[#400px] z-10">
        {children}
      </div>
    </div>
  )
}
