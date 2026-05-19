# Deployment Guide

## Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy this Next.js app with full support for SSR, API routes, and authentication.

### Prerequisites
- GitHub account
- Vercel account (free): https://vercel.com/signup

### Step-by-Step Deployment

1. **Push your code to GitHub** (if not already)
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/yomu.git
   git push -u origin master
   ```

2. **Sign up for Vercel**
   - Go to https://vercel.com/signup
   - Sign up with GitHub

3. **Import your repository**
   - Click "Add New Project"
   - Import `maximunited/yomu` from GitHub
   - Vercel auto-detects Next.js settings

4. **Configure Environment Variables**
   
   In Vercel dashboard → Project Settings → Environment Variables, add:
   
   ```
   DATABASE_URL=file:./prod.db
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
   ```

   **⚠️ Important:** Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - You'll get a URL like: `https://yomu-xyz.vercel.app`

6. **Set up Google OAuth** (if using Google login)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI:
     ```
     https://your-app-name.vercel.app/api/auth/callback/google
     ```
   - Copy Client ID and Secret to Vercel environment variables

7. **Database Considerations**
   
   ⚠️ **SQLite limitations on Vercel:**
   - Vercel uses serverless functions (read-only filesystem)
   - SQLite file:./prod.db won't persist between deployments
   
   **Solutions:**
   - **Option A:** Use **Vercel Postgres** (free tier available)
     ```bash
     # In Vercel dashboard, add Postgres database
     # Update DATABASE_URL to the provided Postgres connection string
     # Update prisma/schema.prisma:
     # datasource db {
     #   provider = "postgresql"
     #   url      = env("DATABASE_URL")
     # }
     ```
   
   - **Option B:** Use **PlanetScale** (MySQL, free tier)
     ```bash
     # Sign up at https://planetscale.com/
     # Create database, get connection string
     # Update DATABASE_URL and schema.prisma provider to "mysql"
     ```
   
   - **Option C:** Use **Supabase** (PostgreSQL, free tier)
     ```bash
     # Sign up at https://supabase.com/
     # Create project, get connection string
     # Update DATABASE_URL and schema.prisma
     ```

8. **Run Prisma migrations** (after switching to Postgres/MySQL)
   ```bash
   # Update schema.prisma provider
   npx prisma db push
   npx prisma generate
   
   # Seed the database
   npm run db:seed
   ```

### Automatic Deployments

Once connected to GitHub:
- Every `git push` to master → Vercel auto-deploys production
- Every PR → Vercel creates preview deployment
- Custom domains supported (free SSL)

### Vercel CLI (Optional)

For local deployment testing:
```bash
npm i -g vercel
vercel login
vercel dev  # Test locally with Vercel environment
vercel --prod  # Deploy to production
```

---

## Option 2: Netlify

Similar to Vercel with good Next.js support.

### Steps:
1. Sign up: https://www.netlify.com/
2. Connect GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables (same as Vercel)
5. Deploy

**Database:** Same limitations as Vercel - use external DB (Postgres/MySQL)

---

## Option 3: Railway (For Full Database Support)

Railway provides persistent storage for SQLite.

### Steps:
1. Sign up: https://railway.app/
2. Create new project from GitHub
3. Add environment variables
4. Railway provisions persistent volume for SQLite
5. Deploy

**Pros:** 
- Supports SQLite with persistence
- $5 free credit per month
- No serverless limitations

**Cons:**
- Paid after free credit expires

---

## Option 4: GitHub Pages (Static Export - Limited)

⚠️ **Not recommended for this app** - GitHub Pages only supports static sites.

**What won't work:**
- ❌ API routes (authentication, database endpoints)
- ❌ NextAuth.js (requires server)
- ❌ Server-side rendering
- ❌ Database operations

**If you still want to try static export:**

1. Update `next.config.js`:
   ```js
   module.exports = {
     output: 'export',
     images: {
       unoptimized: true
     }
   }
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy `out/` folder to GitHub Pages

**Result:** Frontend-only app with no authentication or dynamic features.

---

## Recommended Setup

**Best Option:** Vercel + Vercel Postgres (or PlanetScale)

```
┌─────────────┐
│   Vercel    │  ← Hosting (Next.js app)
│  (Free)     │
└─────────────┘
      │
      ├── Environment Variables
      │   ├── DATABASE_URL (Postgres)
      │   ├── NEXTAUTH_URL
      │   └── NEXTAUTH_SECRET
      │
      └── Connected Services
          ├── GitHub (auto-deploy)
          ├── Vercel Postgres (database)
          └── Google OAuth (optional)
```

**Why:**
- ✅ Free for hobby projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions (API routes)
- ✅ Auto-deployments from GitHub
- ✅ Preview deployments for PRs
- ✅ Easy database integration

---

## Post-Deployment Checklist

After deploying:

1. ✅ Test authentication (sign up/login)
2. ✅ Verify database operations (add memberships, view benefits)
3. ✅ Check Google OAuth redirect URIs
4. ✅ Test dark mode and language switching
5. ✅ Verify API endpoints work
6. ✅ Run database seed if needed
7. ✅ Set up custom domain (optional)

---

## Troubleshooting

### Issue: "Module not found" errors
**Solution:** Ensure all dependencies in `package.json`, run `npm install` before deploy

### Issue: Database not persisting
**Solution:** Switch from SQLite to Postgres/MySQL for serverless environments

### Issue: NEXTAUTH_SECRET not set
**Solution:** Generate and set in environment variables:
```bash
openssl rand -base64 32
```

### Issue: Google OAuth not working
**Solution:** Add Vercel URL to Google OAuth authorized redirect URIs

---

## Cost Comparison

| Platform | Free Tier | Database | Best For |
|----------|-----------|----------|----------|
| **Vercel** | 100GB bandwidth/month | External (Postgres) | Next.js apps |
| **Netlify** | 100GB bandwidth/month | External | Static + serverless |
| **Railway** | $5 credit/month | Included (SQLite/Postgres) | Full-stack apps |
| **GitHub Pages** | Unlimited | None | Static sites only |

For this app: **Vercel + Vercel Postgres = Best Free Option**
