'use client'

import { useMemo, useState } from 'react'
import { Inbox, Plus, Vote } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { usePolls, type PollDraft } from '@/hooks/usePolls'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import PollCard from '@/components/polls/PollCard'
import CreatePollModal from '@/components/polls/CreatePollModal'

export default function PollsPage() {
  const user = useAppStore((state) => state.user)
  const [tab, setTab] = useState<'open' | 'expired'>('open')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [chartViewPollId, setChartViewPollId] = useState<string | null>(null)

  const { polls, isLoading, error, createPoll, deletePoll, vote } = usePolls(user?.id)

  const filteredPolls = useMemo(() => {
    const now = new Date()
    return polls.filter((p) => {
      const isExpired = p.expires_at ? new Date(p.expires_at) < now : false
      return tab === 'expired' ? isExpired : !isExpired
    })
  }, [polls, tab])

  const activeCount = polls.filter((p) => !p.expires_at || new Date(p.expires_at) >= new Date()).length

  const handleCreatePoll = async (input: PollDraft): Promise<boolean> => {
    if (!user) {
      toast.error('You must be signed in to create a poll')
      return false
    }
    if (!input.question || input.options.length < 2) {
      toast.error('Please enter a question and at least 2 options')
      return false
    }

    const ok = await createPoll({ ...input, created_by: user.id })
    if (!ok) {
      toast.error('Could not create the poll. Please try again.')
      return false
    }
    toast.success('Poll created successfully!')
    return true
  }

  const handleVote = async (pollId: string, optionIdx: number) => {
    if (!user) {
      toast.error('You must be signed in to vote!')
      return
    }

    const ok = await vote(pollId, optionIdx, user.id)
    if (!ok) {
      toast.error('Could not save your vote. Please try again.')
      return
    }
    toast.success('Vote submitted!')
  }

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm('Delete this poll?')) return
    const ok = await deletePoll(pollId)
    if (ok) {
      toast.success('Poll deleted')
    } else {
      toast.error('Could not delete the poll. You may not have permission.')
    }
  }

  const tabButtonClass = (active: boolean) =>
    `pb-3 text-sm font-semibold uppercase transition-colors relative ${
      active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white'
    }`

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <PageHeader
        icon={Vote}
        iconClassName="w-6 h-6 text-amber-500"
        title="Classmate Polls & Decision Center"
        subtitle="Cast your vote on study session times, workshop topics, and class events."
        actions={
          user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Poll
            </button>
          )
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
        <div className="flex items-center gap-4">
          <button onClick={() => setTab('open')} className={tabButtonClass(tab === 'open')}>
            Active Polls ({activeCount})
            {tab === 'open' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
          <button onClick={() => setTab('expired')} className={tabButtonClass(tab === 'expired')}>
            Expired Archive
            {tab === 'expired' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Poll Cards Grid */}
      {isLoading ? (
        <EmptyState icon={Inbox} title="Loading polls…" />
      ) : error ? (
        <EmptyState icon={Inbox} title="Couldn't load polls" description={error.message} />
      ) : filteredPolls.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={tab === 'open' ? 'No active polls' : 'No expired polls'}
          description={tab === 'open' ? 'Create a new poll to get started.' : 'Expired polls will appear here.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              canDelete={user?.id === poll.created_by || user?.role === 'admin'}
              isAnalyticsActive={chartViewPollId === poll.id}
              onToggleAnalytics={(id) => setChartViewPollId(chartViewPollId === id ? null : id)}
              onDelete={handleDeletePoll}
              onVote={handleVote}
            />
          ))}
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreateModal && (
        <CreatePollModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreatePoll} />
      )}
    </div>
  )
}
