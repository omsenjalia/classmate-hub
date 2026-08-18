'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ALLOWED_EMAIL_DOMAIN = '@bvmengineering.ac.in'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !!url && !url.includes('placeholder')
}

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAppStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    // Validate email domain
    if (!email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
      toast.error(`Only ${ALLOWED_EMAIL_DOMAIN} emails are allowed`)
      return
    }

    setLoading(true)

    // Helper: create a local/offline session from email
    const localLogin = (role: 'student' | 'admin' = 'student') => {
      const nameFromEmail = email.split('@')[0] || 'Student'
      setUser({
        id: 'user-' + Date.now(),
        username: nameFromEmail,
        display_name: nameFromEmail,
        avatar_url: null,
        bio: null,
        role,
        created_at: new Date().toISOString(),
      })
      toast.success(`Welcome back, ${nameFromEmail}!`)
      router.push('/dashboard')
    }

    // If Supabase is not configured, skip it entirely — go straight to local login
    // This prevents the Supabase client from writing broken auth cookies
    if (!isSupabaseConfigured()) {
      localLogin()
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Login failed. Check your credentials.')
        return
      }

      if (data.user) {
        // Fetch full profile from DB
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          setUser(profile)
        } else {
          const nameFromEmail = email.split('@')[0]
          setUser({
            id: data.user.id,
            username: nameFromEmail,
            display_name: nameFromEmail,
            avatar_url: null,
            bio: null,
            role: 'student',
            created_at: new Date().toISOString(),
          })
        }
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch {
      // Network error — fall back to local session
      localLogin()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign In to ClassmateHub</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access study materials, deadlines, and class polls.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          Register here
        </Link>
      </div>
    </div>
  )
}
