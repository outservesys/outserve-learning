# Outserve Learning Centre

Fully branded LMS portal — React + Vite frontend, Supabase (Postgres) backend, deployed on Vercel.

---

## 1 — Set up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `outserve-learning`, pick a region close to the UK (eu-west-2)
3. Once created, go to **SQL Editor → New query**
4. Paste the entire contents of `supabase/schema.sql` and click **Run**
   - This creates all tables, sets up RLS policies, and seeds your initial data
5. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## 2 — Deploy to Vercel (3 minutes)

### Push to GitHub first
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/outserve-learning.git
git push -u origin main
```

### Import to Vercel
1. [vercel.com](https://vercel.com) → **Add New → Project → Import** your repo
2. Before clicking Deploy, go to **Environment Variables** and add:
   ```
   VITE_SUPABASE_URL      = https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   ```
3. Click **Deploy** — live in ~60 seconds

> Every `git push` auto-deploys. Vercel and Supabase are both free on hobby tier.

---

## Local development

```bash
cp .env.example .env       # add your Supabase keys
npm install
npm run dev                 # http://localhost:5173
```

---

## Customisation

| What | Where |
|---|---|
| Brand colours | `src/index.css` → `:root` variables |
| Logo | Replace `public/outserve-logo.png` |
| Default modules & staff | `supabase/schema.sql` seed section |
| Logged-in learner | `src/pages/Learner.jsx` → `useCurrentUser()` (wire to Supabase Auth when ready) |
| Database queries | `src/context/AppContext.jsx` |

---

## Adding Supabase Auth (next step)

When you're ready to add real logins:
1. Enable **Email** provider in Supabase → Authentication → Providers
2. Add a login page that calls `supabase.auth.signInWithPassword()`
3. Replace `useCurrentUser()` in `Learner.jsx` with `supabase.auth.getUser()`
4. Tighten RLS policies in `schema.sql` to `auth.uid() = staff.user_id`
