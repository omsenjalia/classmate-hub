'use client'

import { useState } from 'react'
import { Message, Profile } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { Trash2, Edit2, Check, X, ShieldCheck, Flag } from 'lucide-react'

export default function MessageBubble({
  message,
  currentUser,
  onDelete,
  onEdit,
  onReport,
}: {
  message: Message
  currentUser: Profile | null
  onDelete: (id: string) => void
  onEdit: (id: string, newContent: string) => void
  onReport?: (id: string) => void
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
              className="my-2 p-3 bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-xs text-emerald-700 dark:text-emerald-400 overflow-x-auto leading-relaxed"
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
    <div className="group relative flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-colors">
      {/* User Avatar */}
      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
        {author.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {author.username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {author.display_name || author.username}
          </span>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">@{author.username}</span>

          {author.role === 'admin' && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">
              <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
            </span>
          )}

          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 ml-auto">
            {formatRelativeTime(message.created_at)}
            {message.edited_at && ' (edited)'}
          </span>
        </div>

        {isEditing ? (
          <div className="space-y-2 mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-indigo-500 dark:border-indigo-400 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:outline-none"
              rows={2}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveEdit}
                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed break-words">
            {renderFormattedContent(message.content)}
          </div>
        )}
      </div>

      {/* Hover Action Buttons */}
      {!isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center p-0.5 shadow-md">
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              title="Edit Message"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              title="Delete Message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isOwner && onReport && (
            <button onClick={() => onReport(message.id)} className="p-1 text-gray-400 hover:text-amber-500 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" title="Report message">
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
