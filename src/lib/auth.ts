export const ALLOWED_EMAIL_DOMAIN = '@bvmengineering.ac.in'

export function isCollegeEmail(email: string) {
  return email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)
}

/** Only allow same-site relative redirects after sign-in. */
export function safeNextPath(next: string | null) {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next
  return '/materials'
}
