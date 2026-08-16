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

File uploads use the GitHub Contents API. Set the GitHub storage variables in
`.env.local` and Vercel. The browser sends files in 3MB chunks, preventing
Vercel's function payload limit from rejecting uploads while keeping the GitHub
token private on the server.

## Checks

```bash
npm run lint
npm run build
```
