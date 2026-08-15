# 🚀 Vercel Deployment Guide for ClassmateHub

This guide will walk you step-by-step through deploying **ClassmateHub** on **Vercel** for 100% free (no credit card required).

---

## 📋 Prerequisites

1. Your GitHub repository: [https://github.com/omsenjalia/classmate-hub](https://github.com/omsenjalia/classmate-hub)
2. Your Private Storage GitHub repository: [https://github.com/omsenjalia/classmate-hub-storage](https://github.com/omsenjalia/classmate-hub-storage)
3. A free [Vercel Account](https://vercel.com/signup) linked with your GitHub profile (`omsenjalia`).

---

## 🔑 Step 1: Generate a GitHub Personal Access Token (PAT)

Because Vercel will upload and stream student study materials directly to/from your private `classmate-hub-storage` repository, you need a Personal Access Token:

1. Go to GitHub: **[GitHub Token Settings](https://github.com/settings/tokens)**
2. Click **Generate new token** -> **Generate new token (classic)**.
3. Set **Note**: `ClassmateHub Vercel Storage Token`
4. Select Expiration: **No expiration** (or 1 year).
5. Check the following scopes:
   - `repo` (Full control of private repositories)
6. Click **Generate token** at the bottom.
7. **Copy the token string** (looks like `ghp_...` or `github_pat_...`). You will paste this into Vercel!

---

## 🌐 Step 2: Import Project on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **Add New...** button in the top right corner -> Select **Project**.
3. Under **Import Git Repository**, find `omsenjalia/classmate-hub` and click **Import**.
4. Leave **Framework Preset** as `Next.js` (automatically detected).
5. Leave **Root Directory** as `./`.

---

## 🔐 Step 3: Add Environment Variables in Vercel

Before clicking Deploy, expand the **Environment Variables** section and add the following keys:

| Environment Variable Name | Recommended Value | Description |
|---|---|---|
| `STORAGE_GITHUB_TOKEN` | `ghp_your_token_here` | The GitHub token copied from Step 1 |
| `STORAGE_GITHUB_OWNER` | `omsenjalia` | Your GitHub username |
| `STORAGE_GITHUB_REPO` | `classmate-hub-storage` | Private storage repository name |
| `STORAGE_GITHUB_BRANCH` | `main` | Storage branch name |
| `NEXT_PUBLIC_SITE_URL` | `https://classmate-hub.vercel.app` | Production URL (update with your final Vercel domain) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Supabase Project URL (Optional / Demo fallback supported) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Anon Key (Optional / Demo fallback supported) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Service Role Key (Optional / Server-side) |

> 💡 *Note: If you haven't set up Supabase yet, you can enter `https://placeholder.supabase.co` and `placeholder` for Supabase keys — the app will run seamlessly in demo preview mode on Vercel!*

---

## 🚢 Step 4: Deploy & Verify

1. Click **Deploy**.
2. Vercel will build the Next.js App Router project (usually takes ~1-2 minutes).
3. Once finished, click **Go to Dashboard** or visit your live domain (e.g. `https://classmate-hub.vercel.app`).
4. **Test Live Site**:
   - Browse Dashboard, Materials, Chat, Polls, Events, and Deadlines.
   - Test sign-in using the **Instant Demo Admin Sign In** button.
   - Upload a test PDF file to verify private GitHub storage commits!
