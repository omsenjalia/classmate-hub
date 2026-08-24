/**
 * Single source of truth for Supabase environment resolution.
 * Used by the browser client, the server client, and the proxy so
 * fallback behavior can never drift between them.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY

export function getSupabaseUrl(): string {
  return SUPABASE_URL || 'https://placeholder.supabase.co'
}

export function getSupabaseKey(): string {
  const key = SUPABASE_KEY || 'placeholder'

  // Safety Guard: Browser MUST NOT use secret service_role key (sb_secret_...)
  if (
    typeof window !== 'undefined' &&
    (key.startsWith('sb_secret_') || key.includes('service_role'))
  ) {
    return 'placeholder'
  }

  return key
}

/** True when real Supabase credentials are present (not placeholders). */
export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_KEY && !SUPABASE_URL.includes('placeholder')
}
