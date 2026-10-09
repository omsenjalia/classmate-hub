import Logo from '@/components/layout/Logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[calc(env(safe-area-inset-top)+20px)]">
      <Logo />
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</main>
      <p className="mx-auto max-w-sm text-center text-xs leading-relaxed text-muted">
        For students of the IT department at BVM Engineering College. Use your college email.
      </p>
    </div>
  )
}
