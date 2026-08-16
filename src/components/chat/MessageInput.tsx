'use client'

import { useState, useRef } from 'react'
import { Send, Bold, Code } from 'lucide-react'

export default function MessageInput({
  onSendMessage,
  channelName,
}: {
  onSendMessage: (content: string) => void
  channelName: string
}) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!content.trim()) return
    onSendMessage(content.trim())
    setContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const selected = content.substring(start, end)
    const newText = content.substring(0, start) + prefix + (selected || 'text') + suffix + content.substring(end)
    setContent(newText)
  }

  return (
    <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 space-y-2 shadow-sm">
      {/* Markdown Helper Toolbar */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-400 dark:text-gray-500">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="p-1.5 hover:text-gray-700 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('```\n', '\n```')}
          className="p-1.5 hover:text-gray-700 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 ml-auto">
          Press <kbd className="bg-gray-100 dark:bg-gray-900/50 px-1 rounded border border-gray-200 dark:border-gray-600">Enter</kbd> to send
        </span>
      </div>

      {/* Input Textarea & Send Button */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}...`}
          className="flex-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
