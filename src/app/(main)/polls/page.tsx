'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { fetchLivePolls } from '@/lib/supabase-data'
import { Poll } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import {
  Vote,
  Plus,
  CheckCircle2,
  Clock,
  BarChart3,
  Lock,
  UserCheck,
  X,
  Trash2,
  Inbox,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

export default function PollsPage() {
  const { user } = useAppStore()
  const [polls, setPolls] = useState<Poll[]>([])
  const [tab, setTab] = useState<'open' | 'expired'>('open')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [chartViewPollId, setChartViewPollId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const data = await fetchLivePolls()
      setPolls(data)
    }
    loadData()
  }, [])

  // Create Poll Form State
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)

  const filteredPolls = useMemo(() => {
    const now = new Date()
    return polls.filter((p) => {
      const isExpired = p.expires_at ? new Date(p.expires_at) < now : false
      return tab === 'expired' ? isExpired : !isExpired
    })
  }, [polls, tab])

  const handleAddOption = () => {
    if (options.length >= 6) {
      toast.error('Maximum 6 poll options allowed')
      return
    }
    setOptions([...options, ''])
  }

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options]
    updated[index] = val
    setOptions(updated)
  }

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault()
    const validOptions = options.map((o) => o.trim()).filter(Boolean)
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Please enter a question and at least 2 options')
      return
    }

    const newPoll: Poll = {
      id: 'poll-' + Date.now(),
      question: question.trim(),
      options: validOptions,
      allow_multiple: allowMultiple,
      is_anonymous: isAnonymous,
      created_by: user?.id || 'user-demo-admin-1',
      expires_at: new Date(Date.now() + 3600000 * 72).toISOString(),
      created_at: new Date().toISOString(),
      profiles: user,
      votes_count: {},
      total_votes: 0,
      user_voted_options: [],
    }

    setPolls([newPoll, ...polls])
    setQuestion('')
    setOptions(['', ''])
    setShowCreateModal(false)
    toast.success('Poll created successfully!')
  }

  const handleVote = (pollId: string, optionIdx: number) => {
    if (!user) {
      toast.error('You must be signed in to vote!')
      return
    }

    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          const currentVotes = { ...(poll.votes_count || {}) }
          const userVoted = poll.user_voted_options || []

          if (poll.allow_multiple) {
            const hasVotedThis = userVoted.includes(optionIdx)
            let newVoted = [...userVoted]
            if (hasVotedThis) {
              newVoted = newVoted.filter((i) => i !== optionIdx)
              currentVotes[optionIdx] = Math.max(0, (currentVotes[optionIdx] || 1) - 1)
            } else {
              newVoted.push(optionIdx)
              currentVotes[optionIdx] = (currentVotes[optionIdx] || 0) + 1
            }

            return {
              ...poll,
              votes_count: currentVotes,
              user_voted_options: newVoted,
              total_votes: Object.values(currentVotes).reduce((a, b) => a + b, 0),
            }
          } else {
            // Single choice
            const oldIdx = userVoted[0]
            if (oldIdx !== undefined) {
              currentVotes[oldIdx] = Math.max(0, (currentVotes[oldIdx] || 1) - 1)
            }
            currentVotes[optionIdx] = (currentVotes[optionIdx] || 0) + 1

            return {
              ...poll,
              votes_count: currentVotes,
              user_voted_options: [optionIdx],
              total_votes: Object.values(currentVotes).reduce((a, b) => a + b, 0),
            }
          }
        }
        return poll
      })
    )

    toast.success('Vote submitted!')
  }

  const handleDeletePoll = (pollId: string) => {
    if (!confirm('Delete this poll?')) return
    setPolls(polls.filter((p) => p.id !== pollId))
    toast.success('Poll deleted')
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Vote className="w-6 h-6 text-amber-500" /> Classmate Polls & Decision Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cast your vote on study session times, workshop topics, and class events.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Poll
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTab('open')}
            className={`pb-3 text-sm font-semibold uppercase transition-colors relative ${
              tab === 'open' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Active Polls ({polls.filter((p) => !p.expires_at || new Date(p.expires_at) >= new Date()).length})
            {tab === 'open' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab('expired')}
            className={`pb-3 text-sm font-semibold uppercase transition-colors relative ${
              tab === 'expired' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Expired Archive
            {tab === 'expired' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Poll Cards Grid */}
      {filteredPolls.length === 0 ? (
        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center space-y-3">
          <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {tab === 'open' ? 'No active polls' : 'No expired polls'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tab === 'open' ? 'Create a new poll to get started.' : 'Expired polls will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolls.map((poll) => {
            const total = poll.total_votes || 1
            const isOwner = user?.id === poll.created_by
            const isAdmin = user?.role === 'admin'
            const canDelete = isOwner || isAdmin
            const isAnalyticsActive = chartViewPollId === poll.id

            const chartData = poll.options.map((opt, idx) => ({
              name: opt.length > 15 ? opt.substring(0, 15) + '...' : opt,
              fullName: opt,
              votes: poll.votes_count?.[idx] || 0,
            }))

            return (
              <div
                key={poll.id}
                className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                        {poll.is_anonymous ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Anonymous Poll
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> By{' '}
                            {poll.profiles?.display_name || poll.profiles?.username || 'Classmate'}
                          </span>
                        )}
                        <span>• {formatDate(poll.created_at)}</span>
                      </div>

                      <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                        {poll.question}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setChartViewPollId(isAnalyticsActive ? null : poll.id)}
                        className={`p-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                          isAnalyticsActive
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-600'
                        }`}
                        title="Toggle Chart Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>

                      {canDelete && (
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="p-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-500/30 transition-colors cursor-pointer"
                          title="Delete Poll"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Option Voting list or Recharts Analytics View */}
                  {isAnalyticsActive ? (
                    <div className="h-48 w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl p-3">
                      <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-2 text-center">
                        Voting Distribution
                      </p>
                      <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="name" stroke="currentColor" className="text-gray-400" fontSize={10} tickLine={false} />
                          <YAxis stroke="currentColor" className="text-gray-400" fontSize={10} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              background: 'var(--color-surface-1, #fff)',
                              border: '1px solid var(--color-border, #e5e7eb)',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#22c55e'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {poll.options.map((opt, idx) => {
                        const count = poll.votes_count?.[idx] || 0
                        const pct = Math.round((count / total) * 100)
                        const isSelected = poll.user_voted_options?.includes(idx)

                        return (
                          <button
                            key={idx}
                            onClick={() => handleVote(poll.id, idx)}
                            className={`w-full text-left relative overflow-hidden bg-gray-50 dark:bg-gray-900/50 border p-3 rounded-xl text-sm transition-all cursor-pointer group ${
                              isSelected
                                ? 'border-indigo-500 dark:border-indigo-400 shadow-sm shadow-indigo-500/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500/40'
                            }`}
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-indigo-100 dark:bg-indigo-500/20 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <span className="text-gray-800 dark:text-white font-medium truncate flex items-center gap-2">
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                                {opt}
                              </span>
                              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">
                                {pct}% ({count})
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span>{poll.total_votes || 0} total votes</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-3.5 h-3.5" /> {poll.allow_multiple ? 'Multi-select' : 'Single-select'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-lg space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Create New Class Poll</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Poll Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Preferred time for Math-1 revision session?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Poll Options (At least 2)
                </label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                    />
                  ))}
                </div>
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add another option
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMultiple}
                    onChange={(e) => setAllowMultiple(e.target.checked)}
                    className="rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-indigo-600"
                  />
                  Allow multiple selections
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-indigo-600"
                  />
                  Anonymous voting
                </label>
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
                  Publish Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
