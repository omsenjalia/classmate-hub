'use client'

import { createClient } from '@/lib/supabase/client'
import { fetchLivePolls } from '@/lib/supabase-data'
import { Poll } from '@/lib/types'
import { useAsyncData } from '@/hooks/useAsyncData'

export type NewPollInput = {
  question: string
  options: string[]
  allow_multiple: boolean
  is_anonymous: boolean
  created_by: string
}

/** What the create form collects before we attach the author. */
export type PollDraft = Omit<NewPollInput, 'created_by'>

interface PollVoteRow {
  poll_id: string
  user_id: string
  selected_options: number[]
}

/** Attaches per-option tallies and the current user's selections to raw polls. */
function applyVotes(
  polls: Poll[],
  votes: PollVoteRow[],
  userId?: string
): Poll[] {
  return polls.map((poll) => {
    const counts: Record<number, number> = {}
    const ownVote = votes.find((vote) => vote.poll_id === poll.id && vote.user_id === userId)
    votes
      .filter((vote) => vote.poll_id === poll.id)
      .forEach((vote) => {
        vote.selected_options.forEach((option: number) => {
          counts[option] = (counts[option] || 0) + 1
        })
      })
    return {
      ...poll,
      votes_count: counts,
      total_votes: votes.filter((vote) => vote.poll_id === poll.id).length,
      user_voted_options: ownVote?.selected_options || [],
    }
  })
}

async function fetchAllPollVotes(): Promise<PollVoteRow[]> {
  try {
    const { data, error } = await createClient()
      .from('poll_votes')
      .select('poll_id, user_id, selected_options')
    return error || !data ? [] : (data as PollVoteRow[])
  } catch {
    return []
  }
}

export function usePolls(userId?: string) {
  const { data, setData, isLoading, error } = useAsyncData<Poll[]>(async () => {
    const [polls, votes] = await Promise.all([fetchLivePolls(), fetchAllPollVotes()])
    return applyVotes(polls, votes, userId)
  }, [userId])

  const polls = data ?? []

  const createPoll = async (input: NewPollInput): Promise<boolean> => {
    const { data: created, error } = await createClient()
      .from('polls')
      .insert({
        question: input.question,
        options: input.options,
        allow_multiple: input.allow_multiple,
        is_anonymous: input.is_anonymous,
        created_by: input.created_by,
        expires_at: new Date(Date.now() + 3600000 * 72).toISOString(),
      })
      .select('*, profiles(*)')
      .single()

    if (error || !created) return false
    setData((current) => [
      { ...(created as Poll), votes_count: {}, total_votes: 0, user_voted_options: [] },
      ...(current ?? []),
    ])
    return true
  }

  /** Replaces the user's previous vote row(s) with the new selection. */
  const saveVote = async (
    pollId: string,
    userId: string,
    selectedOptions: number[]
  ): Promise<boolean> => {
    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId)
      .eq('user_id', userId)
    if (deleteError) return false

    if (selectedOptions.length) {
      const { error } = await supabase
        .from('poll_votes')
        .insert({ poll_id: pollId, user_id: userId, selected_options: selectedOptions })
      if (error) return false
    }
    return true
  }

  const vote = async (
    pollId: string,
    optionIdx: number,
    userId: string
  ): Promise<boolean> => {
    const poll = polls.find((item) => item.id === pollId)
    if (!poll) return true

    const previousOptions = poll.user_voted_options || []
    const selectedOptions = poll.allow_multiple
      ? previousOptions.includes(optionIdx)
        ? previousOptions.filter((index) => index !== optionIdx)
        : [...previousOptions, optionIdx]
      : [optionIdx]

    let snapshot: Poll[] | null = null
    setData((current) => {
      snapshot = current ?? []
      return snapshot.map((poll) => {
        if (poll.id !== pollId) return poll

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
        }

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
      })
    })

    const ok = await saveVote(pollId, userId, selectedOptions)
    if (!ok) {
      if (snapshot) setData(snapshot)
      return false
    }
    return true
  }

  const deletePoll = async (pollId: string): Promise<boolean> => {
    const { error } = await createClient().from('polls').delete().eq('id', pollId)
    if (error) return false
    setData((current) => (current ?? []).filter((poll) => poll.id !== pollId))
    return true
  }

  return { polls, isLoading, error, createPoll, deletePoll, vote }
}
