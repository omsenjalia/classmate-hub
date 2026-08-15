'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { MOCK_EVENTS } from '@/lib/mock-data'
import { EventItem, EventType } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  MapPin,
  Clock,
  UserCheck,
  Check,
  HelpCircle,
  X,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EventsPage() {
  const { user, subjects } = useAppStore()
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Create Event Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<EventType>('study_session')
  const [location, setLocation] = useState('')
  const [startTime, setStartTime] = useState('')
  const [maxAttendees, setMaxAttendees] = useState<string>('')
  const [subjectId, setSubjectId] = useState('')

  const handleRSVP = (eventId: string, newStatus: 'going' | 'maybe' | 'not_going') => {
    if (!user) {
      toast.error('You must be signed in to RSVP for events!')
      return
    }

    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const oldStatus = evt.user_rsvp_status
          let goingDelta = 0
          let maybeDelta = 0

          if (oldStatus === 'going') goingDelta -= 1
          if (oldStatus === 'maybe') maybeDelta -= 1

          if (newStatus === 'going') goingDelta += 1
          if (newStatus === 'maybe') maybeDelta += 1

          return {
            ...evt,
            user_rsvp_status: newStatus,
            going_count: Math.max(0, (evt.going_count || 0) + goingDelta),
            maybe_count: Math.max(0, (evt.maybe_count || 0) + maybeDelta),
          }
        }
        return evt
      })
    )

    toast.success(`RSVP updated to ${newStatus.replace('_', ' ')}`)
  }

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startTime) {
      toast.error('Please enter title and start date/time')
      return
    }

    const newEvt: EventItem = {
      id: 'evt-' + Date.now(),
      title: title.trim(),
      description: description.trim() || null,
      type,
      location: location.trim() || 'BVM IT Department',
      start_time: new Date(startTime).toISOString(),
      end_time: null,
      max_attendees: maxAttendees ? Number(maxAttendees) : null,
      subject_id: subjectId || null,
      created_by: user?.id || 'user-demo-admin-1',
      created_at: new Date().toISOString(),
      profiles: user,
      user_rsvp_status: 'going',
      going_count: 1,
      maybe_count: 0,
    }

    setEvents([newEvt, ...events])
    setTitle('')
    setDescription('')
    setLocation('')
    setStartTime('')
    setShowCreateModal(false)
    toast.success('Event scheduled successfully!')
  }

  const handleDeleteEvent = (id: string) => {
    if (!confirm('Delete this event?')) return
    setEvents(events.filter((e) => e.id !== id))
    toast.success('Event deleted')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-400" /> Class Events & Workshops
          </h1>
          <p className="text-sm text-[#8B91A8] mt-1">
            Group study sessions, practical workshops, revision schedules, and student activities.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-[#1A1D27] p-1 rounded-xl border border-[#2D3148]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-[#4F6EF7] text-white' : 'text-[#8B91A8] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar' ? 'bg-[#4F6EF7] text-white' : 'text-[#8B91A8] hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>

          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#4F6EF7]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Schedule Event
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid View */}
      {viewMode === 'calendar' && (
        <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between text-sm font-bold text-white font-display border-b border-[#2D3148] pb-3">
            <span>August 2026 Academic Calendar</span>
            <span className="text-xs font-mono text-[#8B91A8]">{events.length} Scheduled Events</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-[#8B91A8] pb-2 border-b border-[#2D3148]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, idx) => {
              const day = idx + 1
              const dayEvents = events.filter(
                (e) => new Date(e.start_time).getDate() === day
              )

              return (
                <div
                  key={day}
                  className={`min-h-[80px] p-2 rounded-xl border text-left flex flex-col justify-between ${
                    dayEvents.length > 0
                      ? 'bg-[#242736] border-[#4F6EF7]/40'
                      : 'bg-[#0F1117]/60 border-[#2D3148]/50'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-[#8B91A8]">{day}</span>
                  {dayEvents.map((e) => (
                    <span
                      key={e.id}
                      className="text-[9px] font-mono bg-[#4F6EF7]/20 text-[#4F6EF7] px-1.5 py-0.5 rounded truncate border border-[#4F6EF7]/30"
                    >
                      {e.title}
                    </span>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => {
            const isOwner = user?.id === evt.created_by
            const isAdmin = user?.role === 'admin'
            const canDelete = isOwner || isAdmin

            return (
              <div
                key={evt.id}
                className="bg-[#1A1D27] border border-[#2D3148] hover:border-[#4F6EF7]/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-mono uppercase font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {evt.type.replace('_', ' ')}
                    </span>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold font-display text-white leading-tight">
                      {evt.title}
                    </h2>
                    {evt.description && (
                      <p className="text-xs text-[#8B91A8] mt-1.5 leading-relaxed">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-[#8B91A8] pt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#4F6EF7]" />
                      <span>{formatDate(evt.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>

                {/* 3-State RSVP Buttons */}
                <div className="pt-4 border-t border-[#2D3148] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8B91A8]">
                    <span>Attending: {evt.going_count || 0} Going</span>
                    {evt.maybe_count ? <span>{evt.maybe_count} Maybe</span> : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRSVP(evt.id, 'going')}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        evt.user_rsvp_status === 'going'
                          ? 'bg-emerald-500 text-white border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-[#0F1117] text-[#8B91A8] hover:text-white border-[#2D3148]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Going
                    </button>

                    <button
                      onClick={() => handleRSVP(evt.id, 'maybe')}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        evt.user_rsvp_status === 'maybe'
                          ? 'bg-amber-500 text-white border-amber-400 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-[#0F1117] text-[#8B91A8] hover:text-white border-[#2D3148]'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Maybe
                    </button>

                    <button
                      onClick={() => handleRSVP(evt.id, 'not_going')}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        evt.user_rsvp_status === 'not_going'
                          ? 'bg-red-500 text-white border-red-400 font-bold'
                          : 'bg-[#0F1117] text-[#8B91A8] hover:text-white border-[#2D3148]'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D3148] pb-3">
              <h3 className="text-base font-bold font-display text-white">Schedule Class Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8B91A8] hover:text-white p-1 rounded-lg hover:bg-[#242736]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics Mid-Term Revision Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">
                    Event Type
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
                  >
                    <option value="study_session">Study Session</option>
                    <option value="workshop">Workshop</option>
                    <option value="activity">Class Activity</option>
                    <option value="exam_prep">Exam Prep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">
                  Location / Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. BVM IT Lab 204 or Google Meet link"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Details about what will be covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
                />
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
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
