'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { MOCK_POLLS } from '@/lib/mock-data'
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
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

export default function PollsPage() {
  const { user } = useAppStore()
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS)
  const [tab, setTab] = useState<'open' | 'expired'>('open')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [chartViewPollId, setChartViewPollId] = useState<string | null>(null)

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
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Vote className="w-6 h-6 text-amber-400" /> Classmate Polls & Decision Center
          </h1>
          <p className="text-sm text-[#8B91A8] mt-1">
            Cast your vote on study session times, workshop topics, and class events.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="self-start sm:self-auto bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#4F6EF7]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Poll
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#2D3148] pb-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTab('open')}
            className={`pb-3 text-xs font-mono font-bold uppercase transition-colors relative ${
              tab === 'open' ? 'text-[#4F6EF7]' : 'text-[#8B91A8] hover:text-white'
            }`}
          >
            Active Polls ({polls.filter((p) => !p.expires_at || new Date(p.expires_at) >= new Date()).length})
            {tab === 'open' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F6EF7] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab('expired')}
            className={`pb-3 text-xs font-mono font-bold uppercase transition-colors relative ${
              tab === 'expired' ? 'text-[#4F6EF7]' : 'text-[#8B91A8] hover:text-white'
            }`}
          >
            Expired Archive
            {tab === 'expired' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F6EF7] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Poll Cards Grid */}
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
              className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#8B91A8]">
                      {poll.is_anonymous ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Anonymous Poll
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-[#4F6EF7]" /> By{' '}
                          {poll.profiles?.display_name || poll.profiles?.username || 'Classmate'}
                        </span>
                      )}
                      <span>• {formatDate(poll.created_at)}</span>
                    </div>

                    <h2 className="text-base font-bold font-display text-white leading-snug">
                      {poll.question}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setChartViewPollId(isAnalyticsActive ? null : poll.id)}
                      className={`p-1.5 rounded-lg text-xs border transition-colors ${
                        isAnalyticsActive
                          ? 'bg-[#4F6EF7] text-white border-[#4F6EF7]'
                          : 'bg-[#242736] text-[#8B91A8] hover:text-white border-[#2D3148]'
                      }`}
                      title="Toggle Chart Analytics"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                        title="Delete Poll"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Option Voting list or Recharts Analytics View */}
                {isAnalyticsActive ? (
                  <div className="h-48 w-full bg-[#0F1117] border border-[#2D3148] rounded-xl p-3">
                    <p className="text-[10px] font-mono text-[#8B91A8] mb-2 text-center">
                      Recharts Voting Distribution
                    </p>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#8B91A8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#8B91A8" fontSize={10} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: '#1A1D27', border: '1px solid #2D3148', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                        />
                        <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F6EF7' : '#22C55E'} />
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
                          className={`w-full text-left relative overflow-hidden bg-[#0F1117] border p-3 rounded-xl text-xs transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-[#4F6EF7] shadow-sm shadow-[#4F6EF7]/20'
                              : 'border-[#2D3148] hover:border-[#4F6EF7]/40'
                          }`}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#4F6EF7]/20 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                          <div className="relative z-10 flex items-center justify-between gap-2">
                            <span className="text-white font-medium truncate flex items-center gap-2">
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4F6EF7] shrink-0" />}
                              {opt}
                            </span>
                            <span className="text-[11px] font-mono text-[#8B91A8] shrink-0">
                              {pct}% ({count})
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#8B91A8] pt-3 border-t border-[#2D3148]">
                <span>{poll.total_votes || 0} total votes</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Clock className="w-3.5 h-3.5" /> {poll.allow_multiple ? 'Multi-select' : 'Single-select'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D3148] pb-3">
              <h3 className="text-base font-bold font-display text-white">Create New Class Poll</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8B91A8] hover:text-white p-1 rounded-lg hover:bg-[#242736]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">
                  Poll Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Preferred time for Math-1 revision session?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">
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
                      className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
                    />
                  ))}
                </div>
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 text-xs text-[#4F6EF7] hover:underline font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add another option
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-[#E8EAF0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMultiple}
                    onChange={(e) => setAllowMultiple(e.target.checked)}
                    className="rounded bg-[#0F1117] border-[#2D3148] text-[#4F6EF7]"
                  />
                  Allow multiple selections
                </label>

                <label className="flex items-center gap-2 text-xs text-[#E8EAF0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded bg-[#0F1117] border-[#2D3148] text-[#4F6EF7]"
                  />
                  Anonymous voting
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D3148]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#8B91A8] hover:text-white bg-[#242736]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-[#4F6EF7] hover:bg-[#3B55D4] shadow-md shadow-[#4F6EF7]/20"
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
