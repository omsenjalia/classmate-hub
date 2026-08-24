'use client'

import { Check, Clock, HelpCircle, MapPin, Trash2, X } from 'lucide-react'
import { EventItem } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import type { RsvpStatus } from '@/hooks/useEvents'

const RSVP_OPTIONS: Array<{ status: RsvpStatus; label: string; icon: typeof Check; activeClass: string }> = [
  {
    status: 'going',
    label: 'Going',
    icon: Check,
    activeClass: 'bg-emerald-500 text-white border-emerald-400 font-bold shadow-md shadow-emerald-500/20',
  },
  {
    status: 'maybe',
    label: 'Maybe',
    icon: HelpCircle,
    activeClass: 'bg-amber-500 text-white border-amber-400 font-bold shadow-md shadow-amber-500/20',
  },
  {
    status: 'not_going',
    label: 'Decline',
    icon: X,
    activeClass: 'bg-red-500 text-white border-red-400 font-bold',
  },
]

interface EventCardProps {
  event: EventItem
  canDelete: boolean
  onDelete: (eventId: string) => void
  onRsvp: (eventId: string, status: RsvpStatus) => void
}

export default function EventCard({ event: evt, canDelete, onDelete, onRsvp }: EventCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] font-mono uppercase font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            {evt.type.replace('_', ' ')}
          </span>

          {canDelete && (
            <button
              onClick={() => onDelete(evt.id)}
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
          {RSVP_OPTIONS.map(({ status, label, icon: Icon, activeClass }) => (
            <button
              key={status}
              onClick={() => onRsvp(evt.id, status)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                evt.user_rsvp_status === status
                  ? activeClass
                  : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
