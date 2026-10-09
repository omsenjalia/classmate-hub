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

type Errors = Partial<Record<'username' | 'email' | 'password' | 'form', string>>

function RegisterForm() {
  const router = useRouter()
  const next = safeNextPath(useSearchParams().get('next'))
  const setUser = useAppStore((state) => state.setUser)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const cleanUsername = username.toLowerCase().trim()

  const signInLocally = (id: string) => {
    setUser({
      id,
      username: cleanUsername,
      display_name: displayName.trim() || cleanUsername,
      avatar_url: null,
      bio: null,
      role: 'student',
      created_at: new Date().toISOString(),
    })
    router.push(next)
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors: Errors = {}
    if (!/^[a-z0-9_.]{3,24}$/.test(cleanUsername)) nextErrors.username = '3 to 24 characters: letters, numbers, dots or underscores.'
    if (!isCollegeEmail(email)) nextErrors.email = `Use your ${ALLOWED_EMAIL_DOMAIN} address.`
    if (password.length < 6) nextErrors.password = 'At least 6 characters.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    if (!isSupabaseConfigured()) {
      signInLocally('user-' + Date.now())
      setLoading(false)
      return
    }

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { data, error } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${siteUrl}/materials`,
          data: { username: cleanUsername, display_name: displayName.trim() || cleanUsername },
        },
      })
      if (error) {
        setErrors({ form: error.message || 'Registration failed. Try again.' })
        return
      }
      signInLocally(data.user?.id ?? 'user-' + Date.now())
    } catch {
      signInLocally('user-' + Date.now())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-rise space-y-8">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight">Create your account</h1>
        <p className="mt-1.5 text-[15px] text-muted">One account for every subject&apos;s notes, labs and code.</p>
      </div>

      <form onSubmit={handleRegister} noValidate className="space-y-5">
        <Field label="Username" error={errors.username} hint="Shown next to what you upload">
          {(props) => (
            <input
              {...props}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="rahul_shah"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username"
              className="field"
            />
          )}
        </Field>
        <Field label="Display name" optional>
          {(props) => (
            <input
              {...props}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Rahul Shah"
              autoComplete="name"
              className="field"
            />
          )}
        </Field>
        <Field label="College email" error={errors.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={`yourname${ALLOWED_EMAIL_DOMAIN}`}
              className="field"
            />
          )}
        </Field>
        <Field label="Password" error={errors.password}>
          {(props) => (
            <input
              {...props}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="field"
            />
          )}
        </Field>

        {errors.form && (
          <p role="alert" className="rounded-tile bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have one?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
