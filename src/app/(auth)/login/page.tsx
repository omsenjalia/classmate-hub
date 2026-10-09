'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { ALLOWED_EMAIL_DOMAIN, isCollegeEmail, safeNextPath } from '@/lib/auth'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/Button'
import Field from '@/components/ui/Field'

function LoginForm() {
  const router = useRouter()
  const next = safeNextPath(useSearchParams().get('next'))
  const setUser = useAppStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Local preview session for when Supabase is not configured or unreachable.
  const localLogin = () => {
    const nameFromEmail = email.split('@')[0] || 'student'
    setUser({
      id: 'user-' + Date.now(),
      username: nameFromEmail,
      display_name: nameFromEmail,
      avatar_url: null,
      bio: null,
      role: 'student',
      created_at: new Date().toISOString(),
    })
    router.push(next)
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!isCollegeEmail(email)) {
      setEmailError(`Use your ${ALLOWED_EMAIL_DOMAIN} address.`)
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)
    if (!isSupabaseConfigured()) {
      localLogin()
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (authError) {
        setError(authError.message || 'Email or password is incorrect.')
        return
      }
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
        const nameFromEmail = email.split('@')[0]
        setUser(
          profile ?? {
            id: data.user.id,
            username: nameFromEmail,
            display_name: nameFromEmail,
            avatar_url: null,
            bio: null,
            role: 'student',
            created_at: new Date().toISOString(),
          }
        )
        router.push(next)
      }
    } catch {
      localLogin()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-rise space-y-8">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight">Sign in</h1>
        <p className="mt-1.5 text-[15px] text-muted">Pick up your notes and lab files where you left them.</p>
      </div>

      <form onSubmit={handleLogin} noValidate className="space-y-5">
        <Field label="College email" error={emailError}>
          {(props) => (
            <input
              {...props}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailError(null)
              }}
              placeholder={`yourname${ALLOWED_EMAIL_DOMAIN}`}
              className="field"
            />
          )}
        </Field>
        <Field label="Password">
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
            />
          )}
        </Field>

        {error && (
          <p role="alert" className="rounded-tile bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        New here?{' '}
        <Link href={`/register${next !== '/materials' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
