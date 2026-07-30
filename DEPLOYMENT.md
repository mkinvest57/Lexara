# Deployment Guide

This guide covers deploying Lexara to production.

## 🏗️ Architecture Overview

- **Frontend**: Next.js app on Vercel
- **Backend**: NestJS API on Railway/Render
- **Database**: PostgreSQL on Neon
- **Domain**: Custom domain (optional)

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Railway or Render account (free tier available)
- Neon account (free tier available)

---

## 🗄️ Database Setup (Neon)

### 1. Create Database

1. Go to [Neon](https://neon.tech)
2. Sign up / Log in
3. Create new project: `lexara-prod`
4. Note your connection string

### 2. Connection String Format

```
postgresql://username:password@host/database?sslmode=require
```

Save this for later configuration.

---

## 🔧 Backend Deployment (Railway)

### Option A: Railway (Recommended)

1. **Create Railway Project**
   - Go to [Railway](https://railway.app)
   - "New Project" → "Deploy from GitHub repo"
   - Select your Lexara fork
   - Choose `apps/api` as root directory

2. **Configure Environment Variables**
   ```env
   DATABASE_URL=<your-neon-connection-string>
   JWT_SECRET=<generate-random-string-64-chars>
   JWT_EXPIRES_IN=7d
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   NODE_ENV=production
   ```

3. **Build Settings**
   - Root Directory: `apps/api`
   - Build Command: `pnpm install && pnpm prisma:generate && pnpm build`
   - Start Command: `pnpm start:prod`

4. **Run Migrations**
   ```bash
   # In Railway dashboard, open shell and run:
   pnpm prisma:migrate
   pnpm prisma:seed
   ```

5. **Note Your API URL**
   - Railway will give you a URL like `https://lexara-api-production.up.railway.app`

### Option B: Render

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - "New" → "Web Service"
   - Connect GitHub repo
   - Root Directory: `apps/api`

2. **Configure**
   - Environment: Node
   - Build Command: `cd apps/api && pnpm install && pnpm prisma:generate && pnpm build`
   - Start Command: `cd apps/api && pnpm start:prod`

3. **Environment Variables** (same as Railway)

4. **Run Migrations via SSH**

---

## 🎨 Frontend Deployment (Vercel)

### 1. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. "New Project" → Import from GitHub
3. Select your Lexara repository

### 2. Configure Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd apps/web && pnpm install && pnpm build`
- **Output Directory**: `apps/web/.next`

### 3. Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
NEXTAUTH_URL=https://your-frontend-domain.vercel.app
NEXTAUTH_SECRET=<generate-random-string-64-chars>
```

**Important**: `NEXTAUTH_SECRET` must be different from `JWT_SECRET`

Generate secrets with:
```bash
openssl rand -base64 64
```

### 4. Deploy

- Click "Deploy"
- Wait for build to complete
- Visit your URL!

---

## 🌐 Custom Domain (Optional)

### Frontend (Vercel)

1. Go to Project Settings → Domains
2. Add your domain (e.g., `lexara.com`)
3. Add DNS records at your registrar:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### Backend (Railway)

1. Go to Service Settings → Networking
2. Add custom domain (e.g., `api.lexara.com`)
3. Add DNS record:
   ```
   Type: CNAME
   Name: api
   Value: <your-railway-domain>
   ```

---

## 🔒 Security Checklist

### Before Going Live

- [ ] Change all default secrets
- [ ] Enable CORS only for your frontend domain
- [ ] Set up rate limiting (future enhancement)
- [ ] Enable HTTPS (auto with Vercel/Railway)
- [ ] Review database connection limits
- [ ] Set up error tracking (Sentry)
- [ ] Enable security headers in Next.js

### Recommended next.config.js Headers

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ];
}
```

---

## 📊 Monitoring

### Vercel Analytics (Free)

1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. View metrics in dashboard

### Railway Logs

- Click on service → Logs tab
- Real-time logs
- Filter by keyword

### Database Monitoring (Neon)

- Dashboard shows:
  - Connection count
  - Storage used
  - Query performance

---

## 🔄 CI/CD Pipeline

### Auto-Deploy on Push

Both Vercel and Railway auto-deploy on:
- Push to `main` branch
- Merged pull requests

### Preview Deployments

Vercel creates preview URLs for every PR automatically.

---

## 🐛 Troubleshooting

### "Module not found" errors

```bash
# Clear Railway build cache
Railway Dashboard → Service → Settings → Reset Build Cache
```

### Database connection failed

- Check `DATABASE_URL` format
- Ensure `?sslmode=require` is present
- Verify Neon database is running

### CORS errors

Update backend `.env`:
```env
FRONTEND_URL=https://your-actual-domain.vercel.app
```

### NextAuth errors

- Ensure `NEXTAUTH_URL` matches actual domain
- `NEXTAUTH_SECRET` must be set
- Check cookies are not blocked

---

## 💰 Cost Estimate

### Free Tier (MVP)

- **Vercel**: Free (hobby plan)
- **Railway**: $5/month (500 hours)
- **Neon**: Free (0.5 GB storage)
- **Total**: ~$5/month

### Production (100 users)

- **Vercel**: $20/month (Pro plan)
- **Railway**: $20/month
- **Neon**: $19/month (Scale plan)
- **Total**: ~$60/month

---

## 🚀 Post-Deployment

### 1. Verify Deployment

- [ ] Visit frontend URL
- [ ] Sign up with test account
- [ ] Create language profile
- [ ] Read a lesson
- [ ] Save vocabulary
- [ ] Review cards
- [ ] Check stats

### 2. Seed Production Data

If starting fresh:
```bash
# In Railway shell
pnpm prisma:seed
```

### 3. Monitor First Users

- Watch Railway logs
- Check Vercel analytics
- Monitor Neon connections

### 4. Set Up Backups

Neon auto-backups are included. Configure:
- Backup retention: 7 days (free tier)
- Download manual backups monthly

---

## 📧 Support

Questions? Open an issue on GitHub or email support@lexara.com.

---

**Congratulations! Lexara is now live! 🎉**
