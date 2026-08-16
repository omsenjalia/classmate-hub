# ClassmateHub

ClassmateHub is a Next.js 16 platform for course materials, announcements,
events, deadlines, polls, and class chat.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and configure Supabase. Initialize the
database using `supabase/schema.sql`, then optionally load `supabase/seed.sql`.
For an already initialized database, run
`supabase/migrations/20260816_security_hardening.sql` as well.

File uploads require the five Cloudflare R2 variables in `.env.example`. The
bucket CORS policy must permit browser `PUT` requests from your local and
deployed origins and allow the `Content-Type` header. Files upload directly from
the browser to R2, avoiding Vercel's function request-body limit.

## Checks

```bash
npm run lint
npm run build
```
