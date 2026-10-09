import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/materials" className="flex items-center gap-2.5" aria-label="ClassmateHub library">
      <span className="flex size-8 items-center justify-center overflow-hidden rounded-[9px] border border-line bg-surface p-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="size-full object-contain" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">ClassmateHub</span>
    </Link>
  )
}
