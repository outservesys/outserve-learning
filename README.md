# Outserve Learning Centre

Fully branded learning management portal for Outserve staff. Built with React + Vite.

---

## Deploy to Vercel (recommended — free, 5 minutes)

### Option A: GitHub → Vercel (best for ongoing updates)

1. **Push to GitHub**
   - Go to [github.com/new](https://github.com/new) and create a new **private** repository
   - In your terminal, from this project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/outserve-learning.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com) → Sign up / Log in (free)
   - Click **Add New → Project**
   - Click **Import** next to your GitHub repo
   - Vercel auto-detects Vite — no settings to change
   - Click **Deploy**
   - ✅ Live at `outserve-learning.vercel.app` in ~60 seconds

3. **Custom domain (optional)**
   - In Vercel dashboard → your project → **Settings → Domains**
   - Add `learning.outserve.co.uk` or any domain you own

> Every time you `git push`, Vercel auto-deploys. Pull requests get preview URLs.

---

### Option B: Vercel CLI (no GitHub needed)

```bash
npm install -g vercel   # install once
vercel                  # deploy (follow prompts)
vercel --prod           # promote to production
```

---

## Local development

```bash
npm install
npm run dev             # http://localhost:5173
```

## Production build

```bash
npm run build           # output → dist/
```

---

## Customisation

| What | Where |
|------|-------|
| Brand colours | `src/index.css` — edit `:root` CSS variables |
| Logo | Replace `public/outserve-logo.png` |
| Modules & staff data | `src/data/store.js` |
| Logged-in user | `currentUser` in `src/data/store.js` |
| Backend API | Replace localStorage calls in `src/context/AppContext.jsx` |

---

## Tech stack

- React 18 + React Router v6
- Vite 6
- Recharts (charts)
- Lucide React (icons)
- localStorage for data persistence (swap for API calls when ready)
