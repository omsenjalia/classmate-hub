'use client'

import { use, useMemo, useState } from 'react'
import { ArrowSquareOutIcon, FolderOpenIcon, PlusIcon, ScrollIcon } from '@phosphor-icons/react/dist/ssr'
import { useAppStore } from '@/store/useAppStore'
import { useMaterials } from '@/hooks/useMaterials'
import { sortMaterials } from '@/hooks/useMaterialFilters'
import { SYLLABUS_PDFS } from '@/lib/constants'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import MaterialList, { MaterialListSkeleton } from '@/components/materials/MaterialList'
import DownloadAllButton from '@/components/materials/DownloadAllButton'
import { ChipRow } from '@/components/materials/LibraryControls'

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { subjects, subjectsLoaded } = useAppStore()
  const { materials, labs, isLoading } = useMaterials()
  const [section, setSection] = useState('')

  const subject = subjects.find((item) => item.id === id)
  const subjectLabs = useMemo(() => labs.filter((lab) => lab.subject_id === id), [labs, id])
  const syllabus = subject ? SYLLABUS_PDFS.find((pdf) => pdf.code === subject.code) : undefined

  const subjectMaterials = useMemo(
    () => sortMaterials(materials.filter((item) => item.subject_id === id && !item.is_hidden), 'curated'),
    [materials, id]
  )

  const visible = useMemo(() => {
    if (!section) return subjectMaterials
    if (section === 'lecture') return subjectMaterials.filter((item) => !item.lab_id)
    return subjectMaterials.filter((item) => item.lab_id === section)
  }, [subjectMaterials, section])

  const sectionOptions = [
    { value: '', label: `All ${subjectMaterials.length}` },
    { value: 'lecture', label: 'Lecture notes' },
    ...subjectLabs.map((lab) => ({ value: lab.id, label: lab.name })),
  ]

  if (subjectsLoaded && !subject) {
    return (
      <>
        <PageHeader backHref="/subjects" />
        <EmptyState
          icon={FolderOpenIcon}
          title="Subject not found"
          description="It may have been renamed or removed."
          action={<ButtonLink href="/subjects">All subjects</ButtonLink>}
        />
      </>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        backHref="/subjects"
        title={subject?.name || ''}
        meta={subject && <span className="font-mono font-medium text-accent">{subject.code}</span>}
        actions={
          <ButtonLink href={`/materials/upload?subject=${id}`} variant="ghost" size="sm" aria-label={`Upload to ${subject?.code ?? 'this subject'}`}>
            <PlusIcon className="size-4" weight="bold" /> Add
          </ButtonLink>
        }
      />

      {syllabus && (
        <a
          href={syllabus.url}
          target="_blank"
          rel="noreferrer"
          className="pressable flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 hover:border-line-strong"
        >
          <ScrollIcon className="size-5 text-ink-2" weight="duotone" />
          <span className="flex-1 text-[15px] font-medium">Official syllabus</span>
          <span className="text-sm text-muted">BVM PDF</span>
          <ArrowSquareOutIcon className="size-4 text-muted" aria-hidden />
        </a>
      )}

      {subjectLabs.length > 0 && <ChipRow label="Section" options={sectionOptions} value={section} onChange={setSection} />}

      {isLoading || !subjectsLoaded ? (
        <MaterialListSkeleton rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={FolderOpenIcon}
          title={section ? 'Nothing in this section yet' : 'No materials yet'}
          description="Have notes or a lab write-up for this subject? Share it with the class."
          action={<ButtonLink href={`/materials/upload?subject=${id}`}>Upload material</ButtonLink>}
        />
      ) : (
        <>
          <MaterialList materials={visible} showSubject={false} />
          <div className="pt-2">
            <DownloadAllButton materials={visible} fileName={`${subject?.code ?? 'subject'}-materials.zip`} />
          </div>
        </>
      )}
    </div>
  )
}
