'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { fetchLiveEvents } from '@/lib/supabase-data'
import { EventItem, EventType } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  MapPin,
  Clock,
  Check,
  HelpCircle,
  X,
  Trash2,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EventsPage() {
  const { user, subjects } = useAppStore()
  const [events, setEvents] = useState<EventItem[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Calendar navigation
  const [calendarDate, setCalendarDate] = useState(new Date())

  useEffect(() => {
    async function loadData() {
      const data = await fetchLiveEvents()
      setEvents(data)
    }
    loadData()
  }, [])

  // Create Event Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<EventType>('study_session')
  const [location, setLocation] = useState('')
  const [startTime, setStartTime] = useState('')
  const [maxAttendees, setMaxAttendees] = useState<string>('')
  const [subjectId, setSubjectId] = useState('')

  // Dynamic calendar helpers
  const calendarYear = calendarDate.getFullYear()
  const calendarMonth = calendarDate.getMonth()
  const monthName = calendarDate.toLocaleString('default', { month: 'long' })
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  // Day of week for the 1st (0=Sun, so we convert to Mon-start: Mon=0, Sun=6)
  const firstDayOfWeek = (() => {
    const d = new Date(calendarYear, calendarMonth, 1).getDay()
    return d === 0 ? 6 : d - 1
  })()

  const prevMonth = () => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))
  const nextMonth = () => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))

  const calendarCells = useMemo(() => {
    const cells: Array<{ day: number | null; events: EventItem[] }> = []
    // Empty cells for padding
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ day: null, events: [] })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEvents = events.filter((e) => {
        const eDate = new Date(e.start_time)
        return eDate.getDate() === d && eDate.getMonth() === calendarMonth && eDate.getFullYear() === calendarYear
      })
      cells.push({ day: d, events: dayEvents })
    }
    return cells
  }, [events, calendarMonth, calendarYear, daysInMonth, firstDayOfWeek])

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
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-500" /> Class Events & Workshops
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Group study sessions, practical workshops, revision schedules, and student activities.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            {/* Calendar hidden on mobile, shown on md+ */}
            <button
              onClick={() => setViewMode('calendar')}
              className={`hidden md:flex p-2 rounded-lg text-sm font-medium items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>

          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Schedule Event
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid View — only on md+ */}
      {viewMode === 'calendar' && (
        <div className="hidden md:block bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{monthName} {calendarYear}</span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{events.length} Scheduled Events</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              if (cell.day === null) {
                return <div key={`empty-${idx}`} className="min-h-[80px]" />
              }

              const today = new Date()
              const isToday = cell.day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear()

              return (
                <div
                  key={cell.day}
                  className={`min-h-[80px] p-2 rounded-xl border text-left flex flex-col justify-between ${
                    cell.events.length > 0
                      ? 'bg-indigo-50 dark:bg-gray-700/60 border-indigo-200 dark:border-indigo-500/40'
                      : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200/60 dark:border-gray-700/50'
                  } ${isToday ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
                >
                  <span className={`text-xs font-mono font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>{cell.day}</span>
                  {cell.events.map((e) => (
                    <span
                      key={e.id}
                      className="text-[9px] font-mono bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded truncate border border-indigo-200 dark:border-indigo-500/30"
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
      {(viewMode === 'list' || viewMode === 'calendar') && (
        <div className={viewMode === 'calendar' ? 'md:hidden' : ''}>
          {events.length === 0 ? (
            <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center space-y-3">
              <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No events scheduled</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Schedule an event to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((evt) => {
                const isOwner = user?.id === evt.created_by
                const isAdmin = user?.role === 'admin'
                const canDelete = isOwner || isAdmin

                return (
                  <div
                    key={evt.id}
                    className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[11px] font-mono uppercase font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          {evt.type.replace('_', ' ')}
                        </span>

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="p-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-500/30 transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                          {evt.title}
                        </h2>
                        {evt.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 text-sm font-mono text-gray-500 dark:text-gray-400 pt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{formatDate(evt.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3-State RSVP Buttons */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-gray-400">
                        <span>Attending: {evt.going_count || 0} Going</span>
                        {evt.maybe_count ? <span>{evt.maybe_count} Maybe</span> : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRSVP(evt.id, 'going')}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            evt.user_rsvp_status === 'going'
                              ? 'bg-emerald-500 text-white border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                              : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> Going
                        </button>

                        <button
                          onClick={() => handleRSVP(evt.id, 'maybe')}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            evt.user_rsvp_status === 'maybe'
                              ? 'bg-amber-500 text-white border-amber-400 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> Maybe
                        </button>

                        <button
                          onClick={() => handleRSVP(evt.id, 'not_going')}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            evt.user_rsvp_status === 'not_going'
                              ? 'bg-red-500 text-white border-red-400 font-bold'
                              : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-600'
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
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-lg space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Schedule Class Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics Mid-Term Revision Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Event Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="study_session">Study Session</option>
                    <option value="workshop">Workshop</option>
                    <option value="activity">Class Activity</option>
                    <option value="exam_prep">Exam Prep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Location / Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. BVM IT Lab 204 or Google Meet link"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Details about what will be covered..."
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
