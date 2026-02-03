# Quick Start - Deploy WhatFlow to Production

## ✅ Your App is Ready to Deploy!

The WhatFlow frontend has been configured to connect to your production backend at `https://api.whatomatic.com/Api`.

---

## 🚀 Fastest Deploy (Vercel - Recommended)

### Option A: Using Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy (auto-detects settings)
vercel

# 4. Add environment variables
vercel env add VITE_API_BASE_URL
# When prompted, enter: https://api.whatomatic.com/Api

vercel env add VITE_SHOP_DOMAIN
# When prompted, enter: demo-shop.myshopify.com

# 5. Deploy to production
vercel --prod
```

**Done!** Your app will be live at `https://your-project.vercel.app`

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → Sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure:
   - Framework: **Vite** (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://api.whatomatic.com/Api`
   - `VITE_SHOP_DOMAIN` = `demo-shop.myshopify.com`
6. Click **Deploy**

---

## 🌐 Alternative: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Initialize
netlify init

# 4. Set environment variables
netlify env:set VITE_API_BASE_URL "https://api.whatomatic.com/Api"
netlify env:set VITE_SHOP_DOMAIN "demo-shop.myshopify.com"

# 5. Deploy
netlify deploy --prod
```

---

## 📋 Pre-Deployment Test

Test the production build locally first:

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to verify everything works.

---

## ✅ What's Configured

- ✅ API connected to `https://api.whatomatic.com/Api`
- ✅ Production build tested (6.64s, 2134 modules)
- ✅ SPA routing configured (Netlify)
- ✅ Deployment optimizations in place
- ✅ Environment variables documented

---

## 📚 Full Documentation

- **Deployment Guide**: See [DEPLOYMENT.md](file:///c:/Users/Ehsan%20Nawaz/Downloads/whatflow/whatflow/DEPLOYMENT.md)
- **Troubleshooting**: Check the guide for common issues
- **Custom Domain**: Instructions in deployment guide

---

## 🎯 Next Steps

1. Choose deployment method (Vercel or Netlify)
2. Follow the commands above
3. Test your deployed app
4. Share the URL with your team!

---

Need help? Check the full [DEPLOYMENT.md](file:///c:/Users/Ehsan%20Nawaz/Downloads/whatflow/whatflow/DEPLOYMENT.md) guide.
