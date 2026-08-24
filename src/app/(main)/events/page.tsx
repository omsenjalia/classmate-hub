'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Inbox, List, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useEvents } from '@/hooks/useEvents'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import EventCalendar from '@/components/events/EventCalendar'
import EventCard from '@/components/events/EventCard'
import CreateEventModal from '@/components/events/CreateEventModal'

export default function EventsPage() {
  const user = useAppStore((state) => state.user)
  const subjects = useAppStore((state) => state.subjects)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { events, isLoading, error, createEvent, deleteEvent, setRsvp } = useEvents(user?.id)

  const handleCreateEvent = async (input: Parameters<typeof createEvent>[0]) => {
    if (!user) {
      toast.error('You must be signed in to schedule an event!')
      return false
    }

    const created = await createEvent(input, user.id)
    if (!created) {
      toast.error('Could not schedule the event. Please try again.')
      return false
    }
    toast.success('Event scheduled successfully!')
    return true
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event?')) return
    const ok = await deleteEvent(eventId)
    if (ok) {
      toast.success('Event deleted')
    } else {
      toast.error('Could not delete the event. You may not have permission.')
    }
  }

  const handleRsvp = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    if (!user) {
      toast.error('You must be signed in to RSVP for events!')
      return
    }

    const ok = await setRsvp(eventId, status, user.id)
    if (!ok) {
      toast.error('Could not save your RSVP. Please try again.')
      return
    }
    toast.success(`RSVP updated to ${status.replace('_', ' ')}`)
  }

  const toggleButtonClass = (active: boolean) =>
    `p-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
      active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <PageHeader
        icon={CalendarIcon}
        iconClassName="w-6 h-6 text-emerald-500"
        title="Class Events & Workshops"
        subtitle="Group study sessions, practical workshops, revision schedules, and student activities."
        actions={
          <>
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button onClick={() => setViewMode('list')} className={toggleButtonClass(viewMode === 'list')}>
                <List className="w-3.5 h-3.5" /> List
              </button>
              {/* Calendar hidden on mobile, shown on md+ */}
              <button
                onClick={() => setViewMode('calendar')}
                className={`hidden md:flex ${toggleButtonClass(viewMode === 'calendar')}`}
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
          </>
        }
      />

      {/* Calendar Grid View — only on md+ */}
      {viewMode === 'calendar' && <EventCalendar events={events} />}

      {/* List View */}
      {(viewMode === 'list' || viewMode === 'calendar') && (
        <div className={viewMode === 'calendar' ? 'md:hidden' : ''}>
          {isLoading ? (
            <EmptyState icon={Inbox} title="Loading events…" />
          ) : error ? (
            <EmptyState icon={Inbox} title="Couldn't load events" description={error.message} />
          ) : events.length === 0 ? (
            <EmptyState icon={Inbox} title="No events scheduled" description="Schedule an event to get started." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  canDelete={user?.id === evt.created_by || user?.role === 'admin'}
                  onDelete={handleDeleteEvent}
                  onRsvp={handleRsvp}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          subjects={subjects}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEvent}
        />
      )}
    </div>
  )
}
