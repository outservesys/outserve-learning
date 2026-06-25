# Outserve Learning Centre

Fully branded LMS — React + Vite · Supabase (Postgres + Auth) · Vercel

---

## Setup (10 minutes)

### 1 — Supabase database & auth

1. [supabase.com](https://supabase.com) → New project → name `outserve-learning`, region EU West
2. **SQL Editor → New query** → paste `supabase/schema.sql` → Run
3. **Authentication → Providers → Email** — make sure it's enabled
4. *(Optional but recommended)* Disable email confirmation for internal use:
   **Authentication → Settings → Email** → turn off "Enable email confirmations"

### 2 — Create your first admin account

Because only admins can create accounts via the app, bootstrap the first one manually:

1. **Authentication → Users → Add user** — enter your email + password
2. Copy the UUID shown for that user
3. **SQL Editor → New query** — run:
```sql
insert into public.staff (user_id, name, role, dept, email, avatar, color, is_admin)
values (
  '<your-user-uuid>',
  'Your Name',
  'L&D Manager',
  'HR',
  'you@outserve.co.uk',
  'YN',
  '#00D4B8',
  true
);
```

4. Sign in at your Vercel URL — you're the first admin. All future accounts are created from inside the app.

### 3 — Deploy to Vercel

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/outserve-learning.git
git push -u origin main
```

1. [vercel.com](https://vercel.com) → **Add New → Project → Import** repo
2. Add environment variables before deploying:
   ```
   VITE_SUPABASE_URL       https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY  eyJhbGci...
   ```
   (Found in Supabase → Project Settings → API)
3. **Deploy** — live in ~60 seconds

---

## User types

| | Admin | Staff |
|---|---|---|
| Sign in | ✅ | ✅ |
| View own learning plan | ✅ | ✅ |
| View all staff progress | ✅ | ❌ |
| Create / delete accounts | ✅ | ❌ |
| Manage modules & plans | ✅ | ❌ |
| Assign training | ✅ | ❌ |
| View reports | ✅ | ❌ |

---

## Local development

```bash
cp .env.example .env    # add your Supabase keys
npm install
npm run dev             # http://localhost:5173
```
