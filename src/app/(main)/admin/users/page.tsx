'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheckIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useAsyncData } from '@/hooks/useAsyncData'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { displayName } from '@/lib/utils'
import type { Profile, UserRole } from '@/lib/types'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { SearchField } from '@/components/materials/LibraryControls'
import { MaterialListSkeleton } from '@/components/materials/MaterialList'

async function fetchProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return []
  const { data } = await createClient().from('profiles').select('*').order('created_at', { ascending: true })
  return (data || []) as Profile[]
}

export default function AdminUsersPage() {
  const me = useAppStore((state) => state.user)
  const { data, setData, isLoading } = useAsyncData(fetchProfiles, [])
  const [query, setQuery] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const people = (data ?? []).filter((person) => {
    const q = query.toLowerCase().trim()
    return !q || person.username.toLowerCase().includes(q) || !!person.display_name?.toLowerCase().includes(q)
  })

  const toggleRole = async (person: Profile) => {
    const role: UserRole = person.role === 'admin' ? 'student' : 'admin'
    setSavingId(person.id)
    const { error } = await createClient().from('profiles').update({ role }).eq('id', person.id)
    setSavingId(null)
    if (error) return toast.error(error.message)
    setData((current) => current?.map((row) => (row.id === person.id ? { ...row, role } : row)) ?? null)
    toast.success(`@${person.username} is now ${role === 'admin' ? 'an admin' : 'a student'}`)
  }

  return (
    <div className="space-y-4">
      <SearchField value={query} onChange={setQuery} placeholder="Find by name or username" />
      {isLoading ? (
        <MaterialListSkeleton rows={4} />
      ) : people.length === 0 ? (
        <EmptyState icon={UsersIcon} title={query ? 'No one matches' : 'No accounts yet'} />
      ) : (
        <ul className="overflow-hidden rounded-card border border-line bg-surface">
          {people.map((person) => (
            <li key={person.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
              <Link href={`/profile/${person.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar profile={person} />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 truncate text-[15px] font-medium">
                    {displayName(person)}
                    {person.role === 'admin' && <ShieldCheckIcon className="size-4 shrink-0 text-accent" weight="fill" aria-label="Admin" />}
                  </span>
                  <span className="block truncate text-[13px] text-muted">@{person.username}</span>
                </span>
              </Link>
              {person.id !== me?.id && (
                <Button variant="secondary" size="sm" onClick={() => toggleRole(person)} loading={savingId === person.id}>
                  {person.role === 'admin' ? 'Remove admin' : 'Make admin'}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
