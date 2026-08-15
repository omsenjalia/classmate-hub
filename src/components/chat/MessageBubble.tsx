'use client'

import { useState } from 'react'
import { Message, Profile } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { Trash2, Edit2, Check, X, ShieldCheck } from 'lucide-react'

export default function MessageBubble({
  message,
  currentUser,
  onDelete,
  onEdit,
}: {
  message: Message
  currentUser: Profile | null
  onDelete: (id: string) => void
  onEdit: (id: string, newContent: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const isOwner = currentUser?.id === message.user_id
  const isAdmin = currentUser?.role === 'admin'
  const canDelete = isOwner || isAdmin

  const author = message.profiles || {
    username: 'classmate',
    display_name: 'IT Classmate',
    avatar_url: null,
    role: 'student',
  }

  const handleSaveEdit = () => {
    if (!editContent.trim()) return
    onEdit(message.id, editContent.trim())
    setIsEditing(false)
  }

  // Basic markdown parser helper
  const renderFormattedContent = (content: string) => {
    // Code blocks ```code```
    if (content.includes('```')) {
      const parts = content.split('```')
      return parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return (
            <pre
              key={idx}
              className="my-2 p-3 bg-[#0F1117] border border-[#2D3148] rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed"
            >
              {part.trim()}
            </pre>
          )
        }
        return <span key={idx}>{part}</span>
      })
    }

    return <span>{content}</span>
  }

  return (
    <div className="group relative flex items-start gap-3 p-3 rounded-xl hover:bg-[#1A1D27]/80 transition-colors">
      {/* User Avatar */}
      <div className="w-9 h-9 rounded-full bg-[#4F6EF7]/20 border border-[#4F6EF7]/40 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
        {author.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-[#4F6EF7]">
            {author.username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-white font-display">
            {author.display_name || author.username}
          </span>
          <span className="text-[10px] font-mono text-[#8B91A8]">@{author.username}</span>

          {author.role === 'admin' && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded border border-amber-500/30">
              <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
            </span>
          )}

          <span className="text-[10px] font-mono text-[#8B91A8] ml-auto">
            {formatRelativeTime(message.created_at)}
            {message.edited_at && ' (edited)'}
          </span>
        </div>

        {isEditing ? (
          <div className="space-y-2 mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-[#0F1117] border border-[#4F6EF7] rounded-lg p-2 text-xs text-white focus:outline-none"
              rows={2}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-[#8B91A8] hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveEdit}
                className="p-1 bg-[#4F6EF7] text-white rounded hover:bg-[#3B55D4]"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#E8EAF0] leading-relaxed break-words">
            {renderFormattedContent(message.content)}
          </div>
        )}
      </div>

      {/* Hover Action Buttons */}
      {!isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-2 bg-[#242736] border border-[#2D3148] rounded-lg flex items-center p-0.5 shadow-md">
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-[#8B91A8] hover:text-white rounded hover:bg-[#2D3148]"
              title="Edit Message"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 text-[#8B91A8] hover:text-red-400 rounded hover:bg-[#2D3148]"
              title="Delete Message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
