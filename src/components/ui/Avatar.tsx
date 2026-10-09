import { cn, displayName, initials } from '@/lib/utils'
import type { Profile } from '@/lib/types'

interface AvatarProps {
  profile: Pick<Profile, 'avatar_url' | 'display_name' | 'username'> | null | undefined
  className?: string
}

/** Rounded-square avatar; falls back to initials on the soft accent. */
export default function Avatar({ profile, className }: AvatarProps) {
  const name = displayName(profile)
  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[30%] bg-accent-soft text-[0.8em] font-semibold text-accent-soft-ink',
        className
      )}
    >
      {profile?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar_url} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initials(name) || '?'}</span>
      )}
    </span>
  )
}
