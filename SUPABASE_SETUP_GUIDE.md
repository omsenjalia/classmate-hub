# ⚡ Supabase Setup & Table Import Guide for ClassmateHub

This guide will walk you step-by-step through setting up your free **Supabase** database, executing table migration scripts, populating initial BVM IT syllabus seed data, and configuring admin permissions.

---

## 📋 Prerequisites

You need two SQL files already generated in your project repository:
1. `supabase/schema.sql` (Creates 13 tables, extensions, auto-triggers, & RLS policies)
2. `supabase/seed.sql` (Populates BVM IT Dept Semester 1 subjects, labs, & default channels)

---

## 🗄️ Step 1: Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (sign up with GitHub).
2. Click **New Project**.
3. Select your organization and enter:
   - **Name**: `classmate-hub`
   - **Database Password**: *(Generate & save a secure password)*
   - **Region**: Select closest to your location (e.g., *South Asia / Singapore / India*)
4. Click **Create new project** and wait ~1 minute for Supabase to provision your Postgres database.

---

## 📜 Step 2: Import Tables (Run Schema SQL)

1. In your Supabase Dashboard, click on **SQL Editor** from the left navigation bar (icon looks like `>_`).
2. Click **New Query** at the top.
3. Open [supabase/schema.sql](file:///home/om/ITWeb/supabase/schema.sql) in your code editor and **copy all of its contents**.
4. Paste the entire SQL script into the Supabase SQL Editor.
5. Click the green **Run** button (or press `Ctrl + Enter` / `Cmd + Enter`).
6. You should see a success message: `Success. No rows returned`.

> 💡 **What this created**:
> - Extensions: `uuid-ossp`
> - Tables: `profiles`, `subjects`, `labs`, `materials`, `channels`, `messages`, `polls`, `poll_votes`, `events`, `event_rsvps`, `announcements`, `bookmarks`, `deadlines`
> - Auto-Triggers: Auto-creates student profiles on signup & auto-creates chat channels when subjects are added.
> - Row Level Security (RLS) policies for student and admin permissions.

---

## 🌱 Step 3: Populate Seed Data (Run Seed SQL)

1. Click **New Query** in the Supabase SQL Editor.
2. Open [supabase/seed.sql](file:///home/om/ITWeb/supabase/seed.sql) in your code editor and **copy all of its contents**.
3. Paste the seed SQL script into the SQL Editor.
4. Click **Run**.
5. Success!

> 💡 **What this populated**:
> - Default channels: `#general`, `#off-topic`, `#resources`
> - BVM Semester 1 Subjects: `101BS` (Math-1), `104BS` (Semiconductor Physics), `110ES` (Basic Electrical), `119ES` (Programming in C), `114ES` (IT Workshop), `121HS` (Environmental Science).
> - Experiment Labs for each subject sourced from syllabus PDFs.

---

## 🔑 Step 4: Copy Supabase API Keys to `.env.local` & Vercel

1. In Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Copy the following keys:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **`anon` `public` API key** (looks like `eyJ...`)
   - **`service_role` `secret` key** (looks like `eyJ...`)

3. Update your local `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

4. If deployed on Vercel, update your project environment variables under **Vercel Dashboard -> Settings -> Environment Variables**.

---

## 👑 Step 5: Promote Your Account to Admin

1. Open your live website or local app (`/register`).
2. Register a new student account with your email.
3. Return to **Supabase Dashboard** -> click **Table Editor** (grid icon on left sidebar).
4. Click on the **`profiles`** table.
5. Find your account row, click on the **`role`** column cell (which defaults to `'student'`), and change it to **`admin`**.
6. Click **Save**.
7. Now log in again — you have full access to all `/admin` routes (`/admin/dashboard`, `/admin/subjects`, `/admin/materials`, `/admin/users`, `/admin/announcements`)!
