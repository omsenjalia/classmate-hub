'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MOCK_ANNOUNCEMENTS,
  MOCK_MATERIALS,
  MOCK_EVENTS,
  MOCK_POLLS,
} from '@/lib/mock-data'
import { SYLLABUS_PDFS } from '@/lib/constants'
import { formatDate, formatRelativeTime, formatBytes, getSubjectColor } from '@/lib/utils'
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
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Pin,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [announcements] = useState(MOCK_ANNOUNCEMENTS)
  const [materials] = useState(MOCK_MATERIALS)
  const [events] = useState(MOCK_EVENTS)
  const [polls, setPolls] = useState(MOCK_POLLS)

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
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />
      case 'code':
        return <Code className="w-5 h-5 text-blue-400" />
      case 'video':
        return <Video className="w-5 h-5 text-[#4F6EF7]" />
      case 'zip':
        return <Archive className="w-5 h-5 text-emerald-400" />
      default:
        return <FileText className="w-5 h-5 text-[#8B91A8]" />
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A1D27] via-[#242736] to-[#1A1D27] border border-[#2D3148] p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#4F6EF7]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F6EF7]/15 border border-[#4F6EF7]/30 text-[#4F6EF7] text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" /> BVM IT Class Hub • Semester 1
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight leading-snug">
            Welcome to ClassmateHub
          </h1>
          <p className="text-sm text-[#8B91A8] mt-2 leading-relaxed">
            Your centralized portal for experiment lab manuals, syllabus lecture notes, live subject discussions, and exam deadlines.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              href="/materials"
              className="bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-[#4F6EF7]/20"
            >
              Browse Materials <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat/chan-gen"
              className="bg-[#242736] hover:bg-[#2D3148] border border-[#2D3148] text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Open Class Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Pinned Announcements Banner */}
      {announcements.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#8B91A8]">
            <Pin className="w-3.5 h-3.5 text-[#4F6EF7]" /> Pinned Announcements
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-[#1A1D27] border border-[#4F6EF7]/30 rounded-xl p-5 relative overflow-hidden group hover:border-[#4F6EF7]/60 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#4F6EF7] shrink-0" />
                    <h3 className="text-sm font-bold text-white font-display leading-tight">{ann.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#8B91A8] shrink-0">
                    {formatRelativeTime(ann.created_at)}
                  </span>
                </div>
                <p className="text-xs text-[#8B91A8] leading-relaxed line-clamp-3 pl-6">
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
          {/* Recent Materials */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#4F6EF7]" /> Recent Course Materials
              </h2>
              <Link href="/materials" className="text-xs text-[#4F6EF7] hover:underline flex items-center gap-1 font-medium">
                View All ({materials.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {materials.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1A1D27] border border-[#2D3148] hover:border-[#4F6EF7]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-[#1A1D27]/80"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#242736] border border-[#2D3148] flex items-center justify-center shrink-0">
                      {getFileIcon(item.file_type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/materials/${item.id}`}
                          className="text-sm font-semibold text-white hover:text-[#4F6EF7] transition-colors leading-tight"
                        >
                          {item.title}
                        </Link>
                        {item.subjects && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSubjectColor(
                              item.subjects.code
                            )}`}
                          >
                            {item.subjects.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8B91A8] line-clamp-1">{item.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#8B91A8] font-mono">
                        <span>{formatDate(item.created_at)}</span>
                        {item.file_size_bytes && <span>• {formatBytes(item.file_size_bytes)}</span>}
                        <span>• {item.download_count} downloads</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/materials/${item.id}`}
                    className="self-end sm:self-center shrink-0 bg-[#242736] hover:bg-[#4F6EF7] text-white p-2.5 rounded-lg border border-[#2D3148] hover:border-[#4F6EF7] transition-all"
                    title="View / Download"
                  >
                    <Download className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Active Polls Widget */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Vote className="w-5 h-5 text-amber-400" /> Active Class Polls
              </h2>
              <Link href="/polls" className="text-xs text-[#4F6EF7] hover:underline font-medium">
                All Polls <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {polls.map((poll) => {
                const total = poll.total_votes || 1
                const hasVoted = poll.user_voted_options && poll.user_voted_options.length > 0

                return (
                  <div key={poll.id} className="bg-[#1A1D27] border border-[#2D3148] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-white leading-snug">{poll.question}</h3>

                    <div className="space-y-2">
                      {poll.options.map((opt, idx) => {
                        const count = poll.votes_count?.[idx] || 0
                        const pct = Math.round((count / total) * 100)
                        const isSelected = poll.user_voted_options?.includes(idx)

                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuickVote(poll.id, idx)}
                            className="w-full text-left relative overflow-hidden bg-[#0F1117] border border-[#2D3148] hover:border-[#4F6EF7]/40 p-2.5 rounded-lg text-xs transition-colors cursor-pointer group"
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-[#4F6EF7]/15 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <span className="text-white font-medium truncate flex items-center gap-1.5">
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6EF7]" />}
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

                    <div className="flex items-center justify-between text-[11px] text-[#8B91A8] font-mono border-t border-[#2D3148] pt-3">
                      <span>{poll.total_votes || 0} votes</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Clock className="w-3 h-3" /> {hasVoted ? 'Voted' : 'Open'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right 1 Column: Upcoming Events & Official Syllabi Links */}
        <div className="space-y-8">
          {/* Upcoming Events */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Upcoming Events
              </h2>
              <Link href="/events" className="text-xs text-[#4F6EF7] hover:underline font-medium">
                View Calendar <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="bg-[#1A1D27] border border-[#2D3148] rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {evt.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[#8B91A8] font-mono">{formatDate(evt.start_time)}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white font-display leading-tight">{evt.title}</h3>
                    <p className="text-xs text-[#8B91A8] mt-1 line-clamp-2">{evt.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2D3148]">
                    <span className="text-[#8B91A8] font-mono text-[11px] truncate max-w-[150px]">
                      📍 {evt.location}
                    </span>
                    <button
                      onClick={() => toast.success('RSVP updated to Going!')}
                      className="bg-[#4F6EF7]/15 hover:bg-[#4F6EF7] text-[#4F6EF7] hover:text-white border border-[#4F6EF7]/40 text-xs font-medium px-3 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      RSVP ({evt.going_count})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Official Syllabus PDFs (BVM Engineering College) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" /> BVM Syllabus PDFs
              </h2>
            </div>

            <div className="bg-[#1A1D27] border border-[#2D3148] rounded-xl p-4 space-y-2.5">
              {SYLLABUS_PDFS.map((syl) => (
                <a
                  key={syl.code}
                  href={syl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#0F1117] border border-[#2D3148] hover:border-[#4F6EF7]/50 text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-amber-400 font-bold">{syl.code}</span>
                    <span className="text-[#E8EAF0] truncate">{syl.name}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8B91A8] group-hover:text-[#4F6EF7] shrink-0" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
