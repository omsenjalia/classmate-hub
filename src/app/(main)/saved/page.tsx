'use client'

import { BookmarkSimpleIcon, LockKeyIcon } from '@phosphor-icons/react/dist/ssr'
import { useAppStore } from '@/store/useAppStore'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchBookmarkedMaterials } from '@/lib/supabase-data'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import MaterialList, { MaterialListSkeleton } from '@/components/materials/MaterialList'
import DownloadAllButton from '@/components/materials/DownloadAllButton'

export default function SavedPage() {
  const user = useAppStore((state) => state.user)
  const { data, isLoading } = useAsyncData(
    () => (user ? fetchBookmarkedMaterials(user.id) : Promise.resolve([])),
    [user?.id]
  )
  const saved = data ?? []

  return (
    <div className="space-y-5">
      <PageHeader title="Saved" meta={user && saved.length ? `${saved.length} saved for later` : 'Your reading list for exams and labs'} />

      {!user ? (
        <EmptyState
          icon={LockKeyIcon}
          title="Sign in to keep a reading list"
          description="Tap the bookmark on any material to save it here, on every device."
          action={<ButtonLink href="/login">Sign in</ButtonLink>}
        />
      ) : isLoading ? (
        <MaterialListSkeleton rows={4} />
      ) : saved.length === 0 ? (
        <EmptyState
          icon={BookmarkSimpleIcon}
          title="Nothing saved yet"
          description="Tap the bookmark on a material and it will wait for you here."
          action={
            <ButtonLink href="/materials" variant="secondary">
              Browse the library
            </ButtonLink>
          }
        />
      ) : (
        <>
          <MaterialList materials={saved} />
          <div className="pt-2">
            <DownloadAllButton materials={saved} fileName="saved-materials.zip" />
          </div>
        </>
      )}
    </div>
  )
}
