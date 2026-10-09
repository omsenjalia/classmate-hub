'use client'

import { use, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CameraIcon,
  CaretRightIcon,
  DesktopIcon,
  MoonIcon,
  PencilSimpleIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SunIcon,
  UploadSimpleIcon,
  UserCircleIcon,
} from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'
import { useAppStore, type ThemeMode } from '@/store/useAppStore'
import { useAsyncData } from '@/hooks/useAsyncData'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { MATERIAL_SELECT } from '@/lib/supabase-data'
import { uploadFileInGithubChunks } from '@/lib/github-upload'
import { cn, displayName, formatDate } from '@/lib/utils'
import type { Material, Profile } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'
import Avatar from '@/components/ui/Avatar'
import Sheet from '@/components/ui/Sheet'
import Field from '@/components/ui/Field'
import EmptyState from '@/components/ui/EmptyState'
import { Button, ButtonLink } from '@/components/ui/Button'
import MaterialList, { MaterialListSkeleton } from '@/components/materials/MaterialList'

const THEMES: { value: ThemeMode; label: string; icon: typeof SunIcon }[] = [
  { value: 'system', label: 'Auto', icon: DesktopIcon },
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
]

async function loadProfile(username: string, fallback: Profile | null) {
  if (!isSupabaseConfigured()) {
    return { profile: fallback?.username === username ? fallback : null, uploads: [] as Material[] }
  }
  const supabase = createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle()
  if (!profile) return { profile: null, uploads: [] as Material[] }
  const { data: uploads } = await supabase
    .from('materials')
    .select(MATERIAL_SELECT)
    .eq('uploaded_by', profile.id)
    .order('created_at', { ascending: false })
  return { profile: profile as Profile, uploads: (uploads || []) as Material[] }
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = use(params)
  const username = decodeURIComponent(rawUsername)
  const router = useRouter()
  const { user, setUser, logout, theme, setTheme } = useAppStore()
  const avatarInput = useRef<HTMLInputElement>(null)
  const isOwn = user?.username.toLowerCase() === username.toLowerCase()

  const { data, setData, isLoading } = useAsyncData(() => loadProfile(username, user), [username])
  const profile = data?.profile ?? (isOwn ? user : null)
  const uploads = (data?.uploads ?? []).filter((item) => isOwn || user?.role === 'admin' || !item.is_hidden)

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const openEditor = () => {
    setDraftName(profile?.display_name || '')
    setDraftBio(profile?.bio || '')
    setEditing(true)
  }

  const applyProfile = (updates: Partial<Profile>) => {
    if (user) setUser({ ...user, ...updates })
    setData((current) => (current?.profile ? { ...current, profile: { ...current.profile, ...updates } } : current))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSaving(true)
    const updates = { display_name: draftName.trim() || null, bio: draftBio.trim() || null }
    const { error } = await createClient().from('profiles').update(updates).eq('id', user.id)
    setSaving(false)
    if (error) return toast.error(error.message)
    applyProfile(updates)
    setEditing(false)
    toast.success('Profile updated')
  }

  const handleAvatar = async (file: File | undefined) => {
    if (!file || !user) return
    if (!file.type.startsWith('image/')) return toast.error('Choose an image file')
    setAvatarUploading(true)
    try {
      const upload = await uploadFileInGithubChunks(file)
      const { error } = await createClient().from('profiles').update({ avatar_url: upload.publicUrl }).eq('id', user.id)
      if (error) throw new Error(error.message)
      applyProfile({ avatar_url: upload.publicUrl })
      toast.success('Photo updated')
    } catch {
      toast.error('Could not update your photo')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await createClient().auth.signOut()
    } catch {
      // The local session is cleared below either way.
    }
    logout()
    toast.success('Signed out')
    router.push('/login')
  }

  if (!isLoading && !profile) {
    return (
      <>
        <PageHeader title="Profile" />
        <EmptyState
          icon={UserCircleIcon}
          title={`No one called @${username}`}
          description="Check the spelling, or find them through the materials they shared."
          action={<ButtonLink href="/materials" variant="secondary">Back to the library</ButtonLink>}
        />
      </>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-center pt-8 text-center md:flex-row md:items-center md:gap-5 md:text-left">
        <div className="relative">
          {profile ? <Avatar profile={profile} className="size-24 text-3xl" /> : <div className="skeleton size-24 rounded-[30%]" />}
          {isOwn && (
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              disabled={avatarUploading}
              aria-label="Change photo"
              className="pressable absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-2 border-bg bg-ink text-bg disabled:opacity-60"
            >
              <CameraIcon className={cn('size-[18px]', avatarUploading && 'animate-pulse')} weight="fill" />
            </button>
          )}
          <input ref={avatarInput} type="file" accept="image/png,image/jpeg" className="sr-only" tabIndex={-1} onChange={(event) => { void handleAvatar(event.target.files?.[0]); event.target.value = '' }} />
        </div>
        <div className="mt-4 min-w-0 md:mt-0">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-semibold md:justify-start">
            {profile ? displayName(profile) : <span className="skeleton inline-block h-7 w-40 rounded" />}
            {profile?.role === 'admin' && <ShieldCheckIcon className="size-5 text-accent" weight="fill" aria-label="Admin" />}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            @{username}
            {profile?.created_at && <> joined {formatDate(profile.created_at)}</>}
          </p>
          {profile?.bio && <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-2">{profile.bio}</p>}
        </div>
      </header>

      {isOwn && (
        <section aria-label="Account" className="space-y-3">
          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <button type="button" onClick={openEditor} className="flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left text-[15px] hover:bg-surface-2/60">
              <PencilSimpleIcon className="size-5 text-ink-2" />
              <span className="flex-1">Edit name and bio</span>
              <CaretRightIcon className="size-4 text-muted" />
            </button>
            {user?.role === 'admin' && (
              <Link href="/admin/materials" className="flex items-center gap-3 border-b border-line px-4 py-3.5 text-[15px] hover:bg-surface-2/60">
                <ShieldCheckIcon className="size-5 text-ink-2" />
                <span className="flex-1">Admin tools</span>
                <CaretRightIcon className="size-4 text-muted" />
              </Link>
            )}
            <div className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex-1 text-[15px]">Appearance</span>
              <div role="radiogroup" aria-label="Appearance" className="flex gap-0.5 rounded-[10px] bg-surface-2 p-0.5">
                {THEMES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={theme === option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium',
                      theme === option.value ? 'bg-surface text-ink shadow-float' : 'text-muted'
                    )}
                  >
                    <option.icon className="size-4" /> {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button variant="ghost" className="w-full text-danger" onClick={handleSignOut}>
            <SignOutIcon className="size-5" /> Sign out
          </Button>
        </section>
      )}

      <section aria-labelledby="uploads-heading" className="space-y-3">
        <h2 id="uploads-heading" className="text-sm font-semibold text-ink-2">
          {isOwn ? 'Your uploads' : 'Uploads'}
          {uploads.length > 0 && <span className="ml-1.5 font-normal text-muted">{uploads.length}</span>}
        </h2>
        {isLoading ? (
          <MaterialListSkeleton rows={3} />
        ) : uploads.length === 0 ? (
          <EmptyState
            icon={UploadSimpleIcon}
            title={isOwn ? "You haven't shared anything yet" : 'No uploads yet'}
            description={isOwn ? 'Notes you upload show up here and in the library.' : undefined}
            action={isOwn ? <ButtonLink href="/materials/upload">Upload material</ButtonLink> : undefined}
          />
        ) : (
          <MaterialList materials={uploads} />
        )}
      </section>

      <Sheet open={editing} title="Edit profile" onClose={() => setEditing(false)}>
        <form onSubmit={handleSave} className="space-y-5">
          <Field label="Display name">
            {(props) => <input {...props} value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder={username} className="field" autoComplete="name" />}
          </Field>
          <Field label="Bio" optional hint="A line about you, e.g. your division or roll range">
            {(props) => <textarea {...props} value={draftBio} onChange={(e) => setDraftBio(e.target.value)} rows={3} maxLength={160} className="field resize-none" />}
          </Field>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
