'use client'

import { useState } from 'react'
import { MOCK_ANNOUNCEMENTS } from '@/lib/mock-data'
import { Announcement } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Megaphone, Pin, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(true)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content')
      return
    }

    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      is_pinned: isPinned,
      created_by: 'user-demo-admin-1',
      expires_at: null,
      created_at: new Date().toISOString(),
    }

    setAnnouncements([newAnn, ...announcements])
    setTitle('')
    setContent('')
    toast.success('Announcement published!')
  }

  const handleTogglePin = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_pinned: !a.is_pinned } : a))
    )
    toast.success('Pin state updated')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete announcement?')) return
    setAnnouncements(announcements.filter((a) => a.id !== id))
    toast.success('Announcement removed')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-amber-400" /> Class Announcements
        </h1>
        <p className="text-sm text-[#8B91A8] mt-1">
          Publish site-wide announcements that appear on student dashboards.
        </p>
      </div>

      {/* Form */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold font-display text-white">Create New Announcement</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mid-Semester Test Schedule Announcement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8B91A8] uppercase mb-1">Content *</label>
            <textarea
              rows={3}
              required
              placeholder="Detailed announcement text..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#0F1117] border border-[#2D3148] rounded-xl px-3 py-2 text-xs text-white focus:border-[#4F6EF7] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-white cursor-pointer font-mono">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded bg-[#0F1117] border-[#2D3148] text-[#4F6EF7]"
              />
              Pin to top of student dashboard
            </label>

            <button
              type="submit"
              className="bg-[#4F6EF7] hover:bg-[#3B55D4] text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#4F6EF7]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Publish Announcement
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase text-[#8B91A8]">
          Published Announcements ({announcements.length})
        </h2>

        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-[#1A1D27] border rounded-2xl p-5 space-y-3 transition-all ${
                ann.is_pinned ? 'border-[#4F6EF7]/40 shadow-md' : 'border-[#2D3148]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#4F6EF7]" />
                  <h3 className="text-base font-bold text-white font-display">{ann.title}</h3>
                  {ann.is_pinned && (
                    <span className="text-[9px] bg-[#4F6EF7]/20 text-[#4F6EF7] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" /> PINNED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(ann.id)}
                    className={`p-1.5 rounded-lg text-xs font-mono border transition-colors ${
                      ann.is_pinned
                        ? 'bg-[#4F6EF7]/20 text-[#4F6EF7] border-[#4F6EF7]/40'
                        : 'bg-[#242736] text-[#8B91A8] hover:text-white border-[#2D3148]'
                    }`}
                    title={ann.is_pinned ? 'Unpin' : 'Pin to Top'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#8B91A8] leading-relaxed">{ann.content}</p>

              <div className="text-[10px] font-mono text-[#8B91A8] pt-2 border-t border-[#2D3148]">
                Published {formatDate(ann.created_at)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
