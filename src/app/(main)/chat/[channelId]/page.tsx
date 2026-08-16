'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { Channel, Message } from '@/lib/types'
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
  const { channelId } = use(params)
  const { user, channels } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])

  // Links may use the friendly seeded name (for example /chat/general), while
  // Supabase stores a UUID. Resolve either form before querying or inserting.
  const channel = useMemo<Channel>(() => {
    const found = channels.find((item) => item.id === channelId || item.name === channelId)
    return found || {
      id: channelId,
      name: channelId.replace('chan-', ''),
      description: 'Class channel',
      subject_id: null,
      is_default: true,
      created_at: '',
    }
  }, [channelId, channels])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function loadMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(*)')
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: true })

      if (!cancelled && !error) {
        setMessages((data || []) as Message[])
      }
    }

    void loadMessages()
    const subscription = supabase
      .channel(`chat-${channel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channel.id}`,
        },
        (payload) => {
          const message = payload.new as Message
          setMessages((current) =>
            current.some((item) => item.id === message.id) ? current : [...current, message]
          )
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(subscription)
    }
  }, [channel.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!user) {
      toast.error('You must be signed in to post chat messages!')
      return
    }

    const temporaryId = `pending-${Date.now()}`
    const optimisticMessage: Message = {
      id: temporaryId,
      channel_id: channel.id,
      user_id: user.id,
      content,
      edited_at: null,
      created_at: new Date().toISOString(),
      profiles: user,
    }
    setMessages((current) => [...current, optimisticMessage])

    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ channel_id: channel.id, user_id: user.id, content })
      .select('*, profiles(*)')
      .single()

    if (error || !data) {
      setMessages((current) => current.filter((message) => message.id !== temporaryId))
      toast.error(error?.message || 'Failed to send message')
      return
    }

    setMessages((current) => {
      const withoutTemporary = current.filter((message) => message.id !== temporaryId)
      return withoutTemporary.some((message) => message.id === data.id)
        ? withoutTemporary
        : [...withoutTemporary, data as Message]
    })
  }

  const handleDeleteMessage = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    setMessages((current) => current.filter((message) => message.id !== id))
    toast.success('Message deleted')
  }

  const handleEditMessage = async (id: string, content: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('messages')
      .update({ content, edited_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, content, edited_at: new Date().toISOString() } : message
      )
    )
    toast.success('Message edited')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto space-y-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">{channel.name}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mt-0.5">
              {channel.description || 'Classroom discussion channel'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4 text-emerald-500" /> Live Realtime Channel
        </div>
      </div>

      <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No messages yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Be the first to start a conversation in #{channel.name}!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUser={user}
              onDelete={handleDeleteMessage}
              onEdit={handleEditMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {user ? (
        <MessageInput onSendMessage={handleSendMessage} channelName={channel.name} />
      ) : (
        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" /> Real-time chat requires log-in.
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 underline">Sign in here</Link>
        </div>
      )}
    </div>
  )
}
