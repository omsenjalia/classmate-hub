# ClassmateHub

ClassmateHub is a mobile-first Next.js 16 library of class materials: lecture
notes, lab manuals, solution code and recorded lectures, organised by subject
and lab section. Students can search, filter, preview, save and download
materials (single files or a ZIP of any filtered view), and upload their own.
Admins can hide, reorder and delete materials, manage subjects and lab
sections, and grant admin access.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and configure Supabase. Initialize the
database using `supabase/schema.sql`, then optionally load `supabase/seed.sql`.
For an already initialized database, run
`supabase/migrations/20260816_security_hardening.sql` as well.
Then run `supabase/migrations/20260816_product_features.sql` to enable
material version history.

The app no longer uses the polls, events, deadlines, announcements,
notifications, chat or moderation tables. They can stay in the database
untouched; old URLs for those pages redirect to the library.

File uploads use the GitHub Contents API. Set the GitHub storage variables in
`.env.local` and Vercel. The browser sends files in 3MB chunks, preventing
Vercel's function payload limit from rejecting uploads while keeping the GitHub
token private on the server.

## Checks

```bash
npm run lint
npm run build
```
