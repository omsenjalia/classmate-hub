'use client'

import { use, useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Message, Channel } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import MessageBubble from '@/components/chat/MessageBubble'
import MessageInput from '@/components/chat/MessageInput'
import { Hash, Users, Lock, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>
}) {
  const resolvedParams = use(params)
  const channelId = resolvedParams.channelId

  const { user, channels } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [channel, setChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const found = channels.find((c) => c.id === channelId) || {
      id: channelId,
      name: channelId.replace('chan-', ''),
      description: 'Class channel',
      subject_id: null,
      is_default: true,
      created_at: new Date().toISOString(),
    }
    setChannel(found)

    // Initialize with empty messages — no mock data
    setMessages([])

    // Supabase Realtime Subscription setup
    try {
      const supabase = createClient()
      const channelSub = supabase
        .channel(`chat-${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${channelId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message
            setMessages((prev) => [...prev, newMsg])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channelSub)
      }
    } catch {
      // Fallback preview mode
    }
  }, [channelId, channels])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!user) {
      toast.error('You must be signed in to post chat messages!')
      return
    }

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      channel_id: channelId,
      user_id: user.id,
      content,
      edited_at: null,
      created_at: new Date().toISOString(),
      profiles: user,
    }

    setMessages((prev) => [...prev, newMsg])

    // Attempt Supabase insert
    try {
      const supabase = createClient()
      await supabase.from('messages').insert({
        channel_id: channelId,
        user_id: user.id,
        content,
      })
    } catch {
      // Preview fallback
    }
  }

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
    toast.success('Message deleted')
  }

  const handleEditMessage = (id: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, content: newContent, edited_at: new Date().toISOString() }
          : m
      )
    )
    toast.success('Message edited')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Channel Header */}
      <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {channel?.name || channelId}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mt-0.5">
              {channel?.description || 'Classroom discussion channel'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4 text-emerald-500" /> Live Realtime Channel
        </div>
      </div>

      {/* Message Feed Container */}
      <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No messages yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Be the first to start a conversation in #{channel?.name || 'this channel'}!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUser={user}
              onDelete={handleDeleteMessage}
              onEdit={handleEditMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      {user ? (
        <MessageInput onSendMessage={handleSendMessage} channelName={channel?.name || 'channel'} />
      ) : (
        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" /> Real-time chat requires log-in.{' '}
          <a href="/login" className="text-indigo-600 dark:text-indigo-400 underline">
            Sign In here
          </a>
        </div>
      )}
    </div>
  )
}
