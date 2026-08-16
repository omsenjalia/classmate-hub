'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  fetchLiveAnnouncements,
  fetchLiveMaterials,
  fetchLiveEvents,
  fetchLivePolls,
} from '@/lib/supabase-data'
import { Announcement, Material, EventItem, Poll } from '@/lib/types'
import { SYLLABUS_PDFS } from '@/lib/constants'
import { formatDate, formatRelativeTime, formatBytes, getSubjectColor, getFileTypeInfo } from '@/lib/utils'
import {
  Megaphone,
  FileText,
  Video,
  Code,
  Archive,
  Download,
  Calendar,
  Vote,
  ExternalLink,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Pin,
  Inbox,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [polls, setPolls] = useState<Poll[]>([])

  useEffect(() => {
    async function loadData() {
      const [annData, matData, evtData, pollData] = await Promise.all([
        fetchLiveAnnouncements(),
        fetchLiveMaterials(),
        fetchLiveEvents(),
        fetchLivePolls(),
      ])
      setAnnouncements(annData)
      setMaterials(matData)
      setEvents(evtData)
      setPolls(pollData)
    }
    loadData()
  }, [])

  const handleQuickVote = (pollId: string, optionIndex: number) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          const currentCounts = { ...(poll.votes_count || {}) }
          currentCounts[optionIndex] = (currentCounts[optionIndex] || 0) + 1
          return {
            ...poll,
            votes_count: currentCounts,
            total_votes: (poll.total_votes || 0) + 1,
            user_voted_options: [optionIndex],
          }
        }
        return poll
      })
    )
    toast.success('Vote recorded!')
  }

  const getFileIcon = (fileType?: string | null) => {
    const info = getFileTypeInfo(fileType)
    switch (fileType) {
      case 'pdf':
        return <FileText className={`w-5 h-5 ${info.colorClass}`} />
      case 'code':
        return <Code className={`w-5 h-5 ${info.colorClass}`} />
      case 'video':
        return <Video className={`w-5 h-5 ${info.colorClass}`} />
      case 'zip':
        return <Archive className={`w-5 h-5 ${info.colorClass}`} />
      default:
        return <FileText className={`w-5 h-5 ${info.colorClass}`} />
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 dark:from-indigo-900/80 dark:via-indigo-950/60 dark:to-gray-900/80 border border-indigo-500/30 dark:border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-48 h-48 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 dark:bg-indigo-500/15 border border-white/20 dark:border-indigo-400/30 text-white/90 text-xs font-medium mb-3">
            <BookOpen className="w-3.5 h-3.5" /> BVM IT Class Hub • Semester 1
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            Welcome to ClassmateHub
          </h1>
          <p className="text-sm text-white/70 mt-2 leading-relaxed">
            Your centralized portal for experiment lab manuals, syllabus lecture notes, live subject discussions, and exam deadlines.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              href="/materials"
              className="bg-white text-indigo-700 hover:bg-white/90 text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
            >
              Browse Materials <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat/chan-gen"
              className="bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Open Class Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Pinned Announcements Banner */}
      {announcements.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Pin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Pinned Announcements
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white dark:bg-gray-800/60 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-5 relative overflow-hidden group hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{ann.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 shrink-0">
                    {formatRelativeTime(ann.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 pl-6">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid — 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Materials Feed & Active Polls */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Materials Feed */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Recent Course Materials
              </h2>
              <Link href="/materials" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                View All ({materials.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {materials.length === 0 ? (
              <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center space-y-3">
                <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No materials yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Course materials will appear here once uploaded.</p>
                <Link href="/materials" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Go to Materials <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                        {getFileIcon(item.file_type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/materials/${item.id}`}
                            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-tight"
                          >
                            {item.title}
                          </Link>
                          {item.subjects && (
                            <span
                              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getSubjectColor(
                                item.subjects.code
                              )}`}
                            >
                              {item.subjects.code}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                          <span>{formatDate(item.created_at)}</span>
                          {item.file_size_bytes && <span>• {formatBytes(item.file_size_bytes)}</span>}
                          <span>• {item.download_count} downloads</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/materials/${item.id}`}
                      className="self-end sm:self-center shrink-0 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-600 hover:text-white text-gray-600 dark:text-gray-300 p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-600 transition-all"
                      title="View / Download"
                    >
                      <Download className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active Polls Widget */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Vote className="w-5 h-5 text-amber-500" /> Active Class Polls
              </h2>
              <Link href="/polls" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1">
                All Polls <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {polls.length === 0 ? (
              <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center space-y-3">
                <Vote className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No active polls</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Class polls will appear here when created.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {polls.map((poll) => {
                  const total = poll.total_votes || 1
                  const hasVoted = poll.user_voted_options && poll.user_voted_options.length > 0

                  return (
                    <div key={poll.id} className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{poll.question}</h3>

                      <div className="space-y-2">
                        {poll.options.map((opt, idx) => {
                          const count = poll.votes_count?.[idx] || 0
                          const pct = Math.round((count / total) * 100)
                          const isSelected = poll.user_voted_options?.includes(idx)

                          return (
                            <button
                              key={idx}
                              onClick={() => handleQuickVote(poll.id, idx)}
                              className="w-full text-left relative overflow-hidden bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500/40 p-2.5 rounded-lg text-sm transition-colors cursor-pointer group"
                            >
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-indigo-100 dark:bg-indigo-500/15 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                              <div className="relative z-10 flex items-center justify-between gap-2">
                                <span className="text-gray-800 dark:text-white font-medium truncate flex items-center gap-1.5">
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
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

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-mono border-t border-gray-200 dark:border-gray-700 pt-3">
                        <span>{poll.total_votes || 0} votes</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Clock className="w-3 h-3" /> {hasVoted ? 'Voted' : 'Open'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right 1 Column: Upcoming Events & Official Syllabi Links */}
        <div className="space-y-8">
          {/* Upcoming Events */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" /> Upcoming Events
              </h2>
              <Link href="/events" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1">
                View Calendar <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center space-y-3">
                <Calendar className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No upcoming events</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Events will appear here when scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((evt) => (
                  <div key={evt.id} className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                        {evt.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatDate(evt.start_time)}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{evt.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{evt.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400 font-mono text-xs truncate max-w-[150px]">
                        📍 {evt.location}
                      </span>
                      <button
                        onClick={() => toast.success('RSVP updated to Going!')}
                        className="bg-indigo-100 dark:bg-indigo-500/15 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white border border-indigo-200 dark:border-indigo-500/40 text-xs font-medium px-3 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        RSVP ({evt.going_count})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Official Syllabus PDFs (BVM Engineering College) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" /> BVM Syllabus PDFs
              </h2>
            </div>

            <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2.5">
              {SYLLABUS_PDFS.map((syl) => (
                <a
                  key={syl.code}
                  href={syl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-sm transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-xs">{syl.code}</span>
                    <span className="text-gray-700 dark:text-gray-200 truncate">{syl.name}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
