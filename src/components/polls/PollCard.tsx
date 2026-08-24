'use client'

import { BarChart3, CheckCircle2, Clock, Lock, Trash2, UserCheck } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Poll } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface PollCardProps {
  poll: Poll
  canDelete: boolean
  isAnalyticsActive: boolean
  onToggleAnalytics: (pollId: string) => void
  onDelete: (pollId: string) => void
  onVote: (pollId: string, optionIdx: number) => void
}

export default function PollCard({
  poll,
  canDelete,
  isAnalyticsActive,
  onToggleAnalytics,
  onDelete,
  onVote,
}: PollCardProps) {
  const total = poll.total_votes || 1

  const chartData = poll.options.map((opt, idx) => ({
    name: opt.length > 15 ? opt.substring(0, 15) + '...' : opt,
    fullName: opt,
    votes: poll.votes_count?.[idx] || 0,
  }))

  return (
    <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm">
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
              onClick={() => onToggleAnalytics(poll.id)}
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
                onClick={() => onDelete(poll.id)}
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
                  onClick={() => onVote(poll.id, idx)}
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
}
