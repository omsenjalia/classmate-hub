'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { fetchLiveDeadlines } from '@/lib/supabase-data'
import { Deadline, DeadlineType } from '@/lib/types'
import { formatDate, formatRelativeTime, getDeadlineUrgency, getSubjectColor } from '@/lib/utils'
import {
  Clock,
  Plus,
  Calendar,
  Filter,
  CheckCircle2,
  Trash2,
  X,
  Inbox,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DeadlinesPage() {
  const { user, subjects } = useAppStore()
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    async function loadData() {
      const data = await fetchLiveDeadlines()
      setDeadlines(data)
    }
    loadData()
  }, [])

  // Add deadline state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [type, setType] = useState<DeadlineType>('assignment')

  const filteredDeadlines = useMemo(() => {
    return deadlines
      .filter((d) => {
        if (selectedSubject && d.subject_id !== selectedSubject) return false
        return true
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }, [deadlines, selectedSubject])

  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) {
      toast.error('Please enter title and due date')
      return
    }

    const selectedSub = subjects.find((s) => s.id === subjectId)

    const newDeadline: Deadline = {
      id: 'dl-' + Date.now(),
      title: title.trim(),
      description: description.trim() || null,
      subject_id: subjectId || null,
      due_date: new Date(dueDate).toISOString(),
      type,
      created_by: user?.id || 'user-demo-admin-1',
      created_at: new Date().toISOString(),
      subjects: selectedSub || null,
    }

    setDeadlines([...deadlines, newDeadline])
    setTitle('')
    setDescription('')
    setDueDate('')
    setShowCreateModal(false)
    toast.success('Deadline added to shared class board!')
  }

  const handleDeleteDeadline = (id: string) => {
    if (!confirm('Remove this deadline?')) return
    setDeadlines(deadlines.filter((d) => d.id !== id))
    toast.success('Deadline removed')
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" /> Shared Class Deadlines Board
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track assignment submission dates, lab report cutoffs, and exam schedules.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Deadline
          </button>
        )}
      </div>

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
        {filteredDeadlines.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No deadlines listed</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSubject ? 'You are all caught up for this subject!' : 'No deadlines have been posted yet.'}
            </p>
          </div>
        ) : (
          filteredDeadlines.map((item) => {
            const urgency = getDeadlineUrgency(item.due_date)
            const canDelete = user?.role === 'admin' || user?.id === item.created_by

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800/60 border ${urgency.border} rounded-2xl p-5 sm:p-6 space-y-4 transition-all shadow-sm relative overflow-hidden`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${urgency.bg} ${urgency.color} ${urgency.border}`}
                      >
                        {urgency.label}
                      </span>

                      {item.subjects && (
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getSubjectColor(
                            item.subjects.code
                          )}`}
                        >
                          {item.subjects.code}
                        </span>
                      )}

                      <span className="text-[11px] font-mono uppercase text-gray-500 dark:text-gray-400">
                        Type: {item.type}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {item.title}
                    </h2>

                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDeleteDeadline(item.id)}
                      className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Delete Deadline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="flex items-center gap-1.5 text-gray-900 dark:text-white font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Due: {formatDate(item.due_date)}
                  </span>
                  <span className={urgency.color}>{formatRelativeTime(item.due_date)}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Deadline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Add Class Deadline</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeadline} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basic Electrical Assignment 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="">General</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Deadline Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DeadlineType)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="lab">Lab Report</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Submission instructions or guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Post Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
