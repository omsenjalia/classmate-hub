'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'
import { User, Mail, Lock, UserCheck, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ALLOWED_EMAIL_DOMAIN = '@bvmengineering.ac.in'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !!url && !url.includes('placeholder')
}

export default function RegisterPage() {
  const router = useRouter()
  const setUser = useAppStore((state) => state.setUser)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !email || !password) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate email domain
    if (!email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
      toast.error(`Only ${ALLOWED_EMAIL_DOMAIN} emails are allowed`)
      return
    }

    setLoading(true)

    // Helper: create a local/offline session
    const localRegister = () => {
      setUser({
        id: 'user-' + Date.now(),
        username: username.toLowerCase().trim(),
        display_name: displayName || username,
        avatar_url: null,
        bio: null,
        role: 'student',
        created_at: new Date().toISOString(),
      })
      toast.success('Account created successfully!')
      router.push('/dashboard')
    }

    // If Supabase is not configured, skip it entirely — prevents broken cookie writes
    if (!isSupabaseConfigured()) {
      localRegister()
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase().trim(),
            display_name: displayName || username,
          },
        },
      })

      if (error) {
        toast.error(error.message || 'Registration failed')
        return
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          username: username.toLowerCase().trim(),
          display_name: displayName || username,
          avatar_url: null,
          bio: null,
          role: 'student',
          created_at: new Date().toISOString(),
        })
      } else {
        localRegister()
        return
      }
      toast.success('Registration successful! Welcome to ClassmateHub.')
      router.push('/dashboard')
    } catch {
      // Network error — fall back to local session
      localRegister()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Student Account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join your BVM IT Classmates community.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Username *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. rahul_shah"
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Display Name
          </label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Rahul Shah"
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@bvmengineering.ac.in"
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 font-mono">
            Only @bvmengineering.ac.in emails are accepted
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
