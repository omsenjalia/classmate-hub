'use client'

import { useState, useRef } from 'react'
import { Send, Bold, Code, Sparkles } from 'lucide-react'

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
    <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-3 space-y-2 shadow-xl">
      {/* Markdown Helper Toolbar */}
      <div className="flex items-center gap-1 border-b border-[#2D3148] pb-2 text-[#8B91A8]">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="p-1.5 hover:text-white rounded hover:bg-[#242736] transition-colors"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('```\n', '\n```')}
          className="p-1.5 hover:text-white rounded hover:bg-[#242736] transition-colors"
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-[#8B91A8] ml-auto">
          Press <kbd className="bg-[#0F1117] px-1 rounded border border-[#2D3148]">Enter</kbd> to send
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
          className="flex-1 bg-[#0F1117] border border-[#2D3148] focus:border-[#4F6EF7] rounded-xl p-3 text-xs text-white placeholder-[#8B91A8]/60 focus:outline-none resize-none"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim()}
          className="bg-[#4F6EF7] hover:bg-[#3B55D4] text-white p-3 rounded-xl transition-all shadow-md shadow-[#4F6EF7]/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
