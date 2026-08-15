'use client'

import { use, useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Message, Channel } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import MessageBubble from '@/components/chat/MessageBubble'
import MessageInput from '@/components/chat/MessageInput'
import { Hash, Users, Sparkles, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_CHANNEL_MESSAGES: Record<string, Message[]> = {
  'chan-gen': [
    {
      id: 'msg-1',
      channel_id: 'chan-gen',
      user_id: 'user-demo-admin-1',
      content: 'Welcome to the general class channel! Feel free to ask questions about lectures, lab schedules, or assignments.',
      edited_at: null,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      profiles: {
        id: 'user-demo-admin-1',
        username: 'alex_dev',
        display_name: 'Alex Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'IT Student & Rep',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
    },
    {
      id: 'msg-2',
      channel_id: 'chan-gen',
      user_id: 'user-2',
      content: 'Does anyone have the reference solution for C Programming Lab 3 question 4?',
      edited_at: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      profiles: {
        id: 'user-2',
        username: 'priya_m',
        display_name: 'Priya Mehta',
        avatar_url: null,
        bio: null,
        role: 'student',
        created_at: new Date().toISOString(),
      },
    },
    {
      id: 'msg-3',
      channel_id: 'chan-gen',
      user_id: 'user-demo-admin-1',
      content: 'Yes! Check out the uploaded PDF guide under Materials -> Fundamentals of Programming.',
      edited_at: null,
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      profiles: {
        id: 'user-demo-admin-1',
        username: 'alex_dev',
        display_name: 'Alex Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'IT Student & Rep',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
    },
  ],
}

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

    // Load initial messages from mock or store
    const initial = MOCK_CHANNEL_MESSAGES[channelId] || [
      {
        id: 'msg-default-1',
        channel_id: channelId,
        user_id: 'user-demo-admin-1',
        content: `Welcome to #${found.name}! Start the conversation with your classmates.`,
        edited_at: null,
        created_at: new Date().toISOString(),
        profiles: {
          id: 'user-demo-admin-1',
          username: 'alex_dev',
          display_name: 'Alex Rivera',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: 'IT Student',
          role: 'admin',
          created_at: new Date().toISOString(),
        },
      },
    ]
    setMessages(initial)

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

    // Save to mock cache
    if (!MOCK_CHANNEL_MESSAGES[channelId]) {
      MOCK_CHANNEL_MESSAGES[channelId] = []
    }
    MOCK_CHANNEL_MESSAGES[channelId].push(newMsg)

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
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Channel Header */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4F6EF7]/20 border border-[#4F6EF7]/40 flex items-center justify-center text-[#4F6EF7]">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display text-white flex items-center gap-2">
              {channel?.name || channelId}
            </h1>
            <p className="text-xs text-[#8B91A8] leading-none mt-0.5">
              {channel?.description || 'Classroom discussion channel'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8B91A8]">
          <Users className="w-4 h-4 text-emerald-400" /> Live Realtime Channel
        </div>
      </div>

      {/* Message Feed Container */}
      <div className="flex-1 bg-[#1A1D27]/40 border border-[#2D3148] rounded-2xl p-4 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUser={user}
            onDelete={handleDeleteMessage}
            onEdit={handleEditMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      {user ? (
        <MessageInput onSendMessage={handleSendMessage} channelName={channel?.name || 'channel'} />
      ) : (
        <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-4 text-center text-xs text-[#8B91A8] flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" /> Real-time chat requires log-in.{' '}
          <a href="/login" className="text-[#4F6EF7] underline">
            Sign In here
          </a>
        </div>
      )}
    </div>
  )
}
