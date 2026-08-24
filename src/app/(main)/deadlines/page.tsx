'use client'

import { useMemo, useState } from 'react'
import { Clock, Filter, Inbox, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useDeadlines, type DeadlineDraft } from '@/hooks/useDeadlines'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import DeadlineCard from '@/components/deadlines/DeadlineCard'
import CreateDeadlineModal from '@/components/deadlines/CreateDeadlineModal'

export default function DeadlinesPage() {
  const user = useAppStore((state) => state.user)
  const subjects = useAppStore((state) => state.subjects)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { deadlines, isLoading, error, createDeadline, deleteDeadline } = useDeadlines()

  const filteredDeadlines = useMemo(() => {
    return deadlines
      .filter((d) => {
        if (selectedSubject && d.subject_id !== selectedSubject) return false
        return true
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }, [deadlines, selectedSubject])

  const handleAddDeadline = async (draft: DeadlineDraft): Promise<boolean> => {
    if (!user) {
      toast.error('You must be signed in to add a deadline')
      return false
    }

    // The insert trigger notifies class members; failures surface as toasts.
    const ok = await createDeadline(draft, user.id)
    if (!ok) {
      toast.error('Could not save the deadline. Please try again.')
      return false
    }
    toast.success('Deadline added to shared class board!')
    return true
  }

  const handleDeleteDeadline = async (deadlineId: string) => {
    if (!confirm('Remove this deadline?')) return
    const ok = await deleteDeadline(deadlineId)
    if (ok) {
      toast.success('Deadline removed')
    } else {
      toast.error('Could not remove the deadline. Only admins can delete deadlines.')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        icon={Clock}
        iconClassName="w-6 h-6 text-amber-500"
        title="Shared Class Deadlines Board"
        subtitle="Track assignment submission dates, lab report cutoffs, and exam schedules."
        actions={
          user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Deadline
            </button>
          )
        }
      />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-mono text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Filter by subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} • {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Overdue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> &lt; 3 Days
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Upcoming
          </span>
        </div>
      </div>

      {/* Chronological Deadlines List */}
      <div className="space-y-4">
        {isLoading ? (
          <EmptyState icon={Inbox} title="Loading deadlines…" />
        ) : error ? (
          <EmptyState icon={Inbox} title="Couldn't load deadlines" description={error.message} />
        ) : filteredDeadlines.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No deadlines listed"
            description={
              selectedSubject ? 'You are all caught up for this subject!' : 'No deadlines have been posted yet.'
            }
          />
        ) : (
          filteredDeadlines.map((item) => (
            <DeadlineCard
              key={item.id}
              deadline={item}
              canDelete={user?.role === 'admin'}
              onDelete={handleDeleteDeadline}
            />
          ))
        )}
      </div>

      {/* Add Deadline Modal */}
      {showCreateModal && (
        <CreateDeadlineModal
          subjects={subjects}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleAddDeadline}
        />
      )}
    </div>
  )
}
