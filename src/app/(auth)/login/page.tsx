'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'
import { MOCK_USER } from '@/lib/mock-data'
import { Lock, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

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

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Login failed')
      } else if (data.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          setUser(profile)
        }
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch {
      // Fallback for offline/demo preview mode
      toast.success('Signed in as Demo User')
      setUser(MOCK_USER)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAdmin = () => {
    setUser(MOCK_USER)
    toast.success('Signed in as Class Admin (Demo)')
    router.push('/dashboard')
  }

  return (
    <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-display text-white">Sign In to ClassmateHub</h2>
        <p className="text-sm text-[#8B91A8] mt-1">Access study materials, channels, and class polls.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-medium text-[#8B91A8] uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8B91A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@bvm.ac.in"
              className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#8B91A8]/60 focus:outline-none focus:border-[#4F6EF7] transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-mono font-medium text-[#8B91A8] uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#8B91A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#8B91A8]/60 focus:outline-none focus:border-[#4F6EF7] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#4F6EF7] hover:bg-[#3B55D4] text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#4F6EF7]/20 disabled:opacity-50 cursor-pointer"
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

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#2D3148]" />
        <span className="text-xs text-[#8B91A8] font-mono">OR</span>
        <div className="flex-1 h-px bg-[#2D3148]" />
      </div>

      <button
        type="button"
        onClick={handleDemoAdmin}
        className="w-full bg-[#242736] hover:bg-[#2D3148] border border-[#2D3148] text-[#E8EAF0] text-xs font-mono py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <KeyRound className="w-4 h-4 text-[#4F6EF7]" /> Instant Demo Admin Sign In
      </button>

      <div className="mt-6 text-center text-xs text-[#8B91A8]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#4F6EF7] hover:underline font-medium">
          Register here
        </Link>
      </div>
    </div>
  )
}
