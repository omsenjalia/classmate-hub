'use client'

import { Suspense, useMemo, useState } from 'react'
import { ArrowsDownUpIcon, BooksIcon, MagnifyingGlassIcon, WarningIcon } from '@phosphor-icons/react/dist/ssr'
import { useAppStore } from '@/store/useAppStore'
import { useMaterials } from '@/hooks/useMaterials'
import { SORT_OPTIONS, useMaterialFilters } from '@/hooks/useMaterialFilters'
import { FILE_KINDS } from '@/lib/utils'
import PageHeader from '@/components/layout/PageHeader'
import Sheet from '@/components/ui/Sheet'
import EmptyState from '@/components/ui/EmptyState'
import { Button, ButtonLink } from '@/components/ui/Button'
import MaterialList, { MaterialListSkeleton } from '@/components/materials/MaterialList'
import DownloadAllButton from '@/components/materials/DownloadAllButton'
import { ChipRow, FilterButton, SearchField } from '@/components/materials/LibraryControls'

function Library() {
  const subjects = useAppStore((state) => state.subjects)
  const { materials, labs, isLoading, error } = useMaterials()
  const { filters, update, reset, results, sheetFilterCount, isFiltered } = useMaterialFilters(materials)
  const [sheetOpen, setSheetOpen] = useState(false)

  const subjectOptions = useMemo(
    () => [
      { value: '', label: 'All' },
      ...subjects.map((subject) => ({ value: subject.id, label: subject.code, title: subject.name })),
    ],
    [subjects]
  )

  const labOptions = useMemo(() => {
    const subjectLabs = labs.filter((lab) => lab.subject_id === filters.subject)
    if (!subjectLabs.length) return []
    return [
      { value: '', label: 'Everything' },
      { value: 'lecture', label: 'Lecture notes' },
      ...subjectLabs.map((lab) => ({ value: lab.id, label: lab.name })),
    ]
  }, [labs, filters.subject])

  const activeSubject = subjects.find((subject) => subject.id === filters.subject)
  const sortLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label

  return (
    <div className="space-y-4">
      <PageHeader
        title="Library"
        meta={activeSubject ? activeSubject.name : 'Notes, lab manuals, code and lectures for your class'}
      />

      <div className="sticky top-0 z-30 -mx-4 space-y-3 bg-bg/92 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+8px)] backdrop-blur-xl sm:-mx-6 sm:px-6 md:top-16 md:pt-3">
        <div className="flex items-center gap-2">
          <SearchField value={filters.q} onChange={(q) => update({ q })} />
          <FilterButton count={sheetFilterCount} onClick={() => setSheetOpen(true)} />
        </div>
        {subjects.length > 0 && (
          <ChipRow
            label="Subject"
            mono
            options={subjectOptions}
            value={filters.subject}
            onChange={(subject) => update({ subject, lab: '' })}
          />
        )}
      </div>

      {isLoading ? (
        <MaterialListSkeleton />
      ) : error ? (
        <EmptyState
          icon={WarningIcon}
          title="Couldn't load the library"
          description="Check your connection and try again."
          action={
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      ) : results.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon={MagnifyingGlassIcon}
            title="Nothing matches"
            description={filters.q ? `No materials for "${filters.q}" with these filters.` : 'No materials with these filters yet.'}
            action={
              <Button variant="secondary" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BooksIcon}
            title="The library is empty"
            description="Be the first to share notes, a lab manual or solution code with the class."
            action={<ButtonLink href="/materials/upload">Upload material</ButtonLink>}
          />
        )
      ) : (
        <section aria-label="Materials" className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted" aria-live="polite">
              {results.length} {results.length === 1 ? 'material' : 'materials'}
            </p>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="-mr-2 flex h-9 items-center gap-1.5 rounded-full px-2 font-medium text-ink-2 hover:bg-surface-2"
            >
              <ArrowsDownUpIcon className="size-4" /> {sortLabel}
            </button>
          </div>
          <MaterialList materials={results} showSubject={!filters.subject} />
          <div className="pt-4">
            <DownloadAllButton
              materials={results}
              fileName={activeSubject ? `${activeSubject.code}-materials.zip` : undefined}
            />
          </div>
        </section>
      )}

      <Sheet
        open={sheetOpen}
        title="Filter and sort"
        onClose={() => setSheetOpen(false)}
        footer={
          <>
            <Button variant="ghost" className="flex-1" onClick={() => update({ type: '', lab: '' })}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Show {results.length}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <fieldset className="space-y-2.5">
            <legend className="mb-2.5 text-sm font-medium text-ink-2">Sort by</legend>
            <ChipRow
              label="Sort by"
              wrap
              options={SORT_OPTIONS}
              value={filters.sort}
              onChange={(sort) => update({ sort: sort as typeof filters.sort })}
            />
          </fieldset>
          <fieldset>
            <legend className="mb-2.5 text-sm font-medium text-ink-2">Type</legend>
            <ChipRow
              label="Type"
              wrap
              options={[{ value: '', label: 'Any type' }, ...FILE_KINDS]}
              value={filters.type}
              onChange={(type) => update({ type })}
            />
          </fieldset>
          {labOptions.length > 0 && (
            <fieldset>
              <legend className="mb-2.5 text-sm font-medium text-ink-2">
                Section of {activeSubject?.code}
              </legend>
              <ChipRow label="Section" wrap options={labOptions} value={filters.lab} onChange={(lab) => update({ lab })} />
            </fieldset>
          )}
        </div>
      </Sheet>
    </div>
  )
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<MaterialListSkeleton />}>
      <Library />
    </Suspense>
  )
}
