'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EventItem } from '@/lib/types'

/** Month-grid calendar view (desktop only) with per-day event chips. */
export default function EventCalendar({ events }: { events: EventItem[] }) {
  const [calendarDate, setCalendarDate] = useState(new Date())

  const calendarYear = calendarDate.getFullYear()
  const calendarMonth = calendarDate.getMonth()
  const monthName = calendarDate.toLocaleString('default', { month: 'long' })
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  // Day of week for the 1st (0=Sun, so we convert to Mon-start: Mon=0, Sun=6)
  const firstDayOfWeek = (() => {
    const d = new Date(calendarYear, calendarMonth, 1).getDay()
    return d === 0 ? 6 : d - 1
  })()

  const calendarCells = useMemo(() => {
    const cells: Array<{ day: number | null; events: EventItem[] }> = []
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

  return (
    <div className="hidden md:block bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>{monthName} {calendarYear}</span>
          <button
            onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
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
  )
}
