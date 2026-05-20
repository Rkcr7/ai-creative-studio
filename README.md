<div align="center">

<img width="120" alt="AI Creative Studio logo" src="./logo.png" />

# 🎨 AI Creative Studio

### Generate on-brand ad creatives & visual assets with AI — in seconds.

A creative workspace that turns a brand profile and a short brief into
production-ready marketing visuals, powered by Google Gemini.

![Status](https://img.shields.io/badge/status-active%20development-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini-4285f4?logo=google&logoColor=white)

</div>

> 🚧 **Under active development** — features and APIs may change between updates.
> Feedback and contributions are welcome.

<div align="center">
  <img width="900" alt="AI Creative Studio workspace" src="./public/1.png" />
  <p><em>The workspace — write a brief on the left, watch on-brand creatives fill the gallery on the right.</em></p>
</div>

---

## ✨ What is it?

**AI Creative Studio** is an AI-powered design assistant for marketing teams,
founders, and creators. You define a **brand profile** once — name, guidelines,
logo — and the studio generates polished, on-brand visuals that respect your
look and feel. No design tools, no prompt-engineering expertise required.

Upload a few product shots, describe the campaign, pick an aspect ratio, and
generate a full set of ad creatives ready to ship to social, web, or print.

---

## 🚀 Features

| | Feature | Description |
|---|---------|-------------|
| 🏷️ | **Brand Profiles** | Save brand name, guidelines, and logo once — every generation stays on-brand. |
| 📢 | **Ad Creative mode** | Turn a campaign brief (goal, copy ideas, product details) into finished ad creatives. |
| 🖼️ | **Asset Generation mode** | Generate standalone visual assets from a composition brief, with optional logo + guideline injection. |
| ✏️ | **Editor mode** | Refine any image with natural-language edit instructions ("remove background", "add neon glow"). |
| 📤 | **Reference uploads** | Add up to **8 product images** and **4 style-inspiration images** to steer the AI. |
| 🗂️ | **Per-brand Gallery** | Every generated asset is stored and organized by brand. |
| 🌐 | **Dual environment** | Run fully local (SQLite + filesystem) or in the cloud (Supabase DB + Storage). |
| 🔐 | **Auth-ready** | Google OAuth via Supabase, with a one-flag bypass for local development. |

---

## 🎯 What you can use it for

- **Social ad campaigns** — batch-generate scroll-stopping creatives for Instagram, Facebook, and TikTok.
- **Product marketing** — turn plain product photos into styled lifestyle and hero shots.
- **Brand-consistent content** — keep every asset aligned to one set of brand guidelines.
- **Rapid concepting** — explore visual directions in minutes instead of days.
- **Creative editing** — iterate on existing assets without reopening a design tool.

---

## 📊 At a glance

| Metric | Value |
|--------|-------|
| Creative modes | **3** — Ad Creative · Asset Gen · Editor |
| Aspect ratios | **10** — from `1:1` square to `21:9` ultrawide |
| Max resolution | **4K** (1K / 2K / 4K) |
| Assets per batch | **Up to 10** |
| Reference inputs | **8** product images + **4** style images |
| Storage backends | **2** — local SQLite or Supabase cloud |

---

## 📸 Screenshots

<table>
  <tr>
    <td width="50%">
      <img alt="Visual asset uploads and aspect ratios" src="./public/2.png" /><br/>
      <sub><b>Visual Assets</b> — upload product shots & style inspiration, pick from 10 aspect ratios.</sub>
    </td>
    <td width="50%">
      <img alt="New Brand Profile form" src="./public/3.png" /><br/>
      <sub><b>Brand Profiles</b> — define name, guidelines, and logo once.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img alt="Asset Generation mode" src="./public/4.png" /><br/>
      <sub><b>Asset Gen</b> — generate visuals from a composition brief.</sub>
    </td>
    <td width="50%">
      <img alt="Editor mode" src="./public/5.png" /><br/>
      <sub><b>Editor</b> — refine any image with natural-language instructions.</sub>
    </td>
  </tr>
</table>

---

## 🧰 Tech Stack

- **Frontend:** React 18 · TypeScript · Vite 6
- **AI:** Google Gemini (`@google/genai`)
- **Backend (local):** Express 5 · Prisma 7 · SQLite
- **Backend (cloud):** Supabase (PostgreSQL + Storage)

---

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Gemini API Key with billing enabled** — [Get one here](https://aistudio.google.com/app/apikey)
- **Supabase Account** *(optional — only for cloud mode)* — [Sign up free](https://supabase.com)

> ⚠️ **About the Gemini API key:** This app generates images using `gemini-3-pro-image-preview` (Nano Banana Pro), which is a **Pro tier** model. A **free-tier** key from AI Studio will *not* work for image generation — free tier only covers Flash models. You'll need a key on a **billing-enabled GCP project**. [Enable billing →](https://ai.google.dev/gemini-api/docs/billing)

---

## ⚙️ Setup — Pick Your Path

There are two ways to run AI Creative Studio. Pick the one that matches your situation:

| | 🏠 **Local Setup** *(single machine / personal)* | 🏢 **Production Setup** *(org-wide / team)* |
|---|---|---|
| **Who it's for** | One person trying it out, or solo development | An agency or team sharing brand profiles + assets |
| **Database** | SQLite file on your laptop | Supabase Postgres (cloud) |
| **Storage** | Local `storage/` folder | Supabase Storage bucket |
| **Auth** | Skipped (`BYPASS_AUTH = true`) | Google Sign-In via Supabase, restricted to your team's domain |
| **Setup time** | ~5 min (one script) | ~20 min (Supabase + Google OAuth + deploy) |
| **Cost** | Just Gemini API usage | Same + Supabase (free tier covers small teams) |

> 👉 **Recommended:** start with **Local Setup** to validate it works for you. Moving to Production later is just editing `.env.local` + adding cloud credentials — no code changes.

---

## 🏠 Quick Start — Local Setup *(single machine)*

The fastest path — an interactive setup script that handles everything: prompts for your Gemini key, installs dependencies, runs migrations, creates the storage folder, and starts the dev server. Re-running is safe — already-done steps are skipped.

### macOS / Linux

```bash
bash setup.sh
```

### Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

> 👉 **New here? Just run the script.** It defaults to local mode (SQLite + filesystem) so no Supabase or Google OAuth needed to try it out. It also tells you what each value is for — including the Gemini billing requirement — before asking.

When it's done, your browser opens to [http://localhost:3000](http://localhost:3000).

<details>
<summary><b>What the script does (step-by-step)</b></summary>

| Step | What it checks / does |
|------|----------------------|
| 1 | Verifies you're in the project root (`package.json`) |
| 2 | Verifies Node.js v18+ is installed (links to download if not) |
| 3 | Creates `.env.local` from `.env.example` if missing |
| 4 | Prompts for your **Gemini API key** — with a note about free vs paid tier (Pro Image model needs billing enabled) |
| 5 | Asks **local vs cloud mode**; if cloud, prompts for Supabase URL + anon key |
| 6 | Runs `npm install` if `node_modules` is missing or stale |
| 7 | Runs `prisma migrate deploy` to create `dev.db` (local mode only) |
| 8 | Creates `storage/creatives/` folder for asset uploads (local mode only) |
| 9 | Starts the dev server (`npm run dev` or `npm run dev:prod`) |

The script validates input format (Gemini key starts with `AIza`, Supabase URL matches `*.supabase.co`, anon key is a JWT) so typos are caught before they break the app.

</details>

<details>
<summary><b>Manual setup (if you prefer to do it by hand)</b></summary>

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Add your GEMINI_API_KEY in .env.local
#    (Supabase keys are optional — only needed for cloud mode)

# 4. Run database migrations (local mode)
DATABASE_URL="file:./dev.db" npx prisma migrate deploy

# 5. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

</details>

---

## 🏢 Production Setup — Organization-Wide *(team / cloud)*

Use this path when you want your whole agency/team to share brand profiles, gallery assets, and sign in with their work Google account.

You'll wire up **three things** (~20 min total):

1. **🗄️ Supabase project** — hosts the Postgres DB and the asset storage bucket.
   → Follow [**Supabase Setup**](#️-supabase-setup) below (create project, run SQL, create `creatives` bucket).

2. **🔐 Google OAuth via Supabase** — so only your team's email domain can sign in.
   → Follow [**GOOGLE_AUTH_SETUP.md**](./GOOGLE_AUTH_SETUP.md) (10-min walkthrough with screenshots).

3. **🚀 Production-mode toggle** — switch the app from "bypass auth, local DB" to "require Google, cloud DB":
   - In `.env.local`: set `APP_ENV=production` and fill in `SUPABASE_URL` + `SUPABASE_ANON_KEY`
   - In `App.tsx`: set `BYPASS_AUTH = false` and change `ALLOWED_DOMAIN` to your team's domain
   - Run `npm run dev:prod` (or deploy the built app to any host — Vercel, Render, etc.)

> 💡 **The setup script also handles Production mode.** If your `.env.local` already has `APP_ENV=production`, `setup.sh` / `setup.ps1` will prompt for your Supabase credentials and start the cloud-mode dev server.

> 📦 **One-click cloud deploy** (Vercel/Supabase integration) is on the roadmap — for now, deploy the `npm run build` output to any static host that runs Node.

---

## 🔧 Environment Setup *(reference for both paths)*

> 💡 The setup script writes this file for you. This section is here for reference — read it if you want to know what each variable does or edit `.env.local` by hand.

1. **Copy the template file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your credentials:
   ```env
   # Gemini API Key (Required)
   GEMINI_API_KEY=your_actual_gemini_api_key

   # Supabase Credentials (Required for cloud features)
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

> ⚠️ **Important:** Never commit `.env.local` to version control!

---

## 🔐 Authentication *(skipped in Local; required in Production)*

The app supports **Google Sign-In via Supabase**, with a one-flag bypass for local development.

### Quick toggle (in `App.tsx`)

```typescript
const BYPASS_AUTH = true;                  // dev: skip login, mock session
const ALLOWED_DOMAIN = 'yourdomain.com';   // prod: only this email domain can sign in
```

| Value | Behavior |
|-------|----------|
| `BYPASS_AUTH = true` | ✅ Auth skipped — app loads immediately (good for local dev) |
| `BYPASS_AUTH = false` | 🔐 Requires Google Sign-In; only `@ALLOWED_DOMAIN` emails are accepted |

> ⚠️ **Before flipping to `false`**, change `ALLOWED_DOMAIN` away from the default `'yourdomain.com'` — otherwise no one will be able to sign in.

### Setting up Google Sign-In (production)

To make `BYPASS_AUTH = false` actually work, you need to wire up Google OAuth in **both** Supabase and Google Cloud. Follow the step-by-step guide:

### 👉 **[GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)** — 10-minute walkthrough with screenshots

It covers: grabbing the Supabase callback URL, creating the Google Cloud OAuth app, where to paste the **Authorized redirect URI**, restricting access to your Workspace org, and troubleshooting.

---

## 🗄️ Supabase Setup *(Production / Org-wide path only)*

> Only needed for **Production / Org-wide setup**. For Local Setup, the app uses SQLite and
> local file storage out of the box — see [DEVELOPMENT.md](./DEVELOPMENT.md).

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name:** `creative-studio` (or any name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"**
5. Wait for project to initialize (1-2 minutes)

### 2. Get Project Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values to your `.env.local`:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`

Example:
```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Create Storage Bucket

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **"New bucket"**
3. Enter:
   - **Name:** `creatives`
   - **Public bucket:** ✅ Enable (toggle ON)
4. Click **"Create bucket"**

> 💡 The bucket name must be exactly `creatives` to match the app code.

### 4. Run SQL Setup

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. **Copy and paste the ENTIRE SQL script below**
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

<details>
<summary><b>📜 Click to expand the complete SQL setup script</b></summary>

```sql
-- ===========================================
-- AI CREATIVE STUDIO - DATABASE SETUP
-- ===========================================
-- Run this entire script in Supabase SQL Editor
-- This will create all tables, policies, and storage setup

-- ===========================================
-- STEP 1: CREATE TABLES
-- ===========================================

-- Brand Profiles Table
CREATE TABLE IF NOT EXISTS brand_profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  guidelines TEXT,
  logo_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Generated Assets Table
CREATE TABLE IF NOT EXISTS generated_assets (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  url TEXT NOT NULL,
  prompt_used TEXT,
  aspect_ratio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ===========================================
-- STEP 2: ENABLE ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on brand_profiles
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on generated_assets
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 3: CREATE ACCESS POLICIES
-- ===========================================
-- These policies allow public CRUD access (suitable for development/internal tools)
-- For production with user accounts, you'd want more restrictive policies

-- Drop existing policies if they exist (prevents errors on re-run)
DROP POLICY IF EXISTS "Public Profiles Access" ON brand_profiles;
DROP POLICY IF EXISTS "Public Assets Access" ON generated_assets;

-- Allow full public access to brand_profiles (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Public Profiles Access" ON brand_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow full public access to generated_assets (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Public Assets Access" ON generated_assets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ===========================================
-- STEP 4: SETUP STORAGE BUCKET
-- ===========================================

-- Create the 'creatives' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('creatives', 'creatives', true)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- STEP 5: STORAGE POLICIES
-- ===========================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Reads" ON storage.objects;
DROP POLICY IF EXISTS "Public Deletes" ON storage.objects;

-- Allow public uploads to 'creatives' bucket
CREATE POLICY "Public Uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'creatives');

-- Allow public reads from 'creatives' bucket
CREATE POLICY "Public Reads" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'creatives');

-- Allow public deletes from 'creatives' bucket
CREATE POLICY "Public Deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'creatives');

-- ===========================================
-- ✅ SETUP COMPLETE!
-- ===========================================
-- Your database is now ready for AI Creative Studio
```

</details>

---

## ▶️ Running the App

### Development Mode

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run preview
```

> For the full local development guide (dual environments, scripts, database
> management, API endpoints), see **[DEVELOPMENT.md](./DEVELOPMENT.md)**.

---

## 🐛 Troubleshooting

### "Database not connected" Error

- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly in `.env.local`
- Restart the dev server after changing environment variables

### "RLS policy" or "Permission denied" Errors

- Make sure you ran the complete SQL setup script
- Check that RLS policies were created successfully in Supabase Dashboard > Authentication > Policies

### Images not uploading

- Verify the `creatives` storage bucket exists and is public
- Check storage policies in Supabase Dashboard > Storage > Policies

### Google Sign-In Issues (Production)

- Ensure `BYPASS_AUTH = false` and `ALLOWED_DOMAIN` is set correctly in `App.tsx`
- Follow the full step-by-step in **[GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)** — it covers Supabase + Google Cloud config and the most common `redirect_uri_mismatch` fix

### TypeScript Errors in IDE

If you see errors about `process` not being found, run:
```bash
npm install
```
These are dev-time warnings and won't affect runtime.

---

## 📄 License

Released under the **[MIT License](./LICENSE)** — free to use, modify, and
distribute. Just keep the copyright notice.

---

## 🔗 Links

- **Gemini API Keys:** https://aistudio.google.com/app/apikey
- **Supabase:** https://supabase.com
- **Development Guide:** [DEVELOPMENT.md](./DEVELOPMENT.md)
