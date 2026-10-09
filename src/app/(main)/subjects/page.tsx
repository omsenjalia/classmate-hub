'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { CaretRightIcon, SquaresFourIcon } from '@phosphor-icons/react/dist/ssr'
import { useAppStore } from '@/store/useAppStore'
import { useMaterials } from '@/hooks/useMaterials'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import type { Subject } from '@/lib/types'

export default function SubjectsPage() {
  const { subjects, subjectsLoaded } = useAppStore()
  const { materials, labs, isLoading } = useMaterials()

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of materials) {
      if (item.is_hidden || !item.subject_id) continue
      map.set(item.subject_id, (map.get(item.subject_id) || 0) + 1)
    }
    return map
  }, [materials])

  const semesters = useMemo(() => {
    const groups = new Map<number, Subject[]>()
    for (const subject of subjects) {
      groups.set(subject.semester, [...(groups.get(subject.semester) || []), subject])
    }
    return [...groups.entries()].sort(([a], [b]) => a - b)
  }, [subjects])

  const labCount = (subjectId: string) => labs.filter((lab) => lab.subject_id === subjectId).length

  return (
    <div className="space-y-6">
      <PageHeader title="Subjects" meta="Browse materials course by course" />

      {!subjectsLoaded ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading subjects">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-[68px] rounded-card" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState icon={SquaresFourIcon} title="No subjects yet" description="An admin adds subjects for each semester. Check back soon." />
      ) : (
        semesters.map(([semester, list]) => (
          <section key={semester} aria-labelledby={semesters.length > 1 ? `sem-${semester}` : undefined} className="space-y-2.5">
            {semesters.length > 1 && (
              <h2 id={`sem-${semester}`} className="text-sm font-semibold text-ink-2">
                Semester {semester}
              </h2>
            )}
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {list.map((subject, index) => {
                const count = counts.get(subject.id) || 0
                const sections = labCount(subject.id)
                return (
                  <li key={subject.id} className="animate-rise" style={{ animationDelay: `${index * 30}ms` }}>
                    <Link
                      href={`/subjects/${subject.id}`}
                      className="pressable flex items-center gap-4 rounded-card border border-line bg-surface px-4 py-3.5 hover:border-line-strong"
                    >
                      <span className="w-14 shrink-0 font-mono text-[13px] font-semibold text-accent">{subject.code}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">{subject.name}</span>
                        <span className="block text-[13px] text-muted">
                          {isLoading ? 'Counting' : `${count} ${count === 1 ? 'material' : 'materials'}`}
                          {sections > 0 && `, ${sections} lab ${sections === 1 ? 'section' : 'sections'}`}
                        </span>
                      </span>
                      <CaretRightIcon className="size-4 shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
