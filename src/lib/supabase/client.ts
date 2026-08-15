import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://placeholder.supabase.co'

  let key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    'placeholder'

  // Safety Guard: Browser MUST NOT use secret service_role key (sb_secret_...)
  if (key.startsWith('sb_secret_') || key.includes('service_role')) {
    key = 'placeholder'
  }

  return createBrowserClient(url, key)
}
