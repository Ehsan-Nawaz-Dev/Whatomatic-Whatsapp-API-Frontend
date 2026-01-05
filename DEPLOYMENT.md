# WhatFlow Frontend Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the WhatFlow React frontend application as a standalone web app. The app is configured to connect to the backend API at `https://what-flow-backend.vercel.app/api`.

---

## Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- Account on hosting platform (Vercel, Netlify, or custom server)

---

## Environment Variables

Before deployment, ensure the following environment variables are configured:

```env
VITE_API_BASE_URL=https://what-flow-backend.vercel.app/api
VITE_SHOP_DOMAIN=demo-shop.myshopify.com
```

These are already set in the `.env` file for local development. You'll need to configure them in your hosting platform for production.

---

## Option 1: Deploy to Vercel (Recommended)

### Quick Deploy

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N**
   - What's your project's name? **whatflow**
   - In which directory is your code located? **./**

4. **Set Environment Variables** (one-time setup):
   ```bash
   vercel env add VITE_API_BASE_URL
   ```
   Enter: `https://what-flow-backend.vercel.app/api`
   
   ```bash
   vercel env add VITE_SHOP_DOMAIN
   ```
   Enter: `demo-shop.myshopify.com`

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://what-flow-backend.vercel.app/api`
   - `VITE_SHOP_DOMAIN` = `demo-shop.myshopify.com`
6. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`

---

## Option 2: Deploy to Netlify

### Using Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize Site**:
   ```bash
   netlify init
   ```
   
   Follow the prompts:
   - Create & configure a new site
   - Choose your team
   - Enter site name: **whatflow**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**:
   ```bash
   netlify env:set VITE_API_BASE_URL "https://what-flow-backend.vercel.app/api"
   netlify env:set VITE_SHOP_DOMAIN "demo-shop.myshopify.com"
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Using Netlify Dashboard

1. Go to [netlify.com](https://www.netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to your Git provider
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add Environment Variables (Site settings → Build & deploy → Environment):
   - `VITE_API_BASE_URL` = `https://what-flow-backend.vercel.app/api`
   - `VITE_SHOP_DOMAIN` = `demo-shop.myshopify.com`
6. Click **Deploy site**

Your app will be live at `https://your-site.netlify.app`

---

## Option 3: Custom Server / VPS

### Build for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Output**: The production-ready files will be in the `dist/` directory

### Deploy to Custom Server

1. **Upload the `dist/` folder** to your web server

2. **Configure Web Server**:

   #### For Nginx:
   ```nginx
   server {
       listen 80;
       server_name whatflow.yourdomain.com;
       root /var/www/whatflow/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   }
   ```

   #### For Apache (.htaccess):
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </IfModule>
   ```

3. **Set Environment Variables**:
   
   Create a `.env.production` file in your project root before building:
   ```env
   VITE_API_BASE_URL=https://what-flow-backend.vercel.app/api
   VITE_SHOP_DOMAIN=demo-shop.myshopify.com
   ```

4. **Enable HTTPS**: Use Let's Encrypt or your SSL certificate provider

---

## Testing Your Deployment

### Local Production Build Test

Before deploying, test the production build locally:

```bash
# Build
npm run build

# Preview
npm run preview
```

Visit `http://localhost:4173` and verify:
- ✅ Application loads without errors
- ✅ All routes work (/, /dashboard, /about, etc.)
- ✅ API calls connect to backend
- ✅ No console errors

### Post-Deployment Checks

After deployment, verify:

1. **Homepage**: Navigate to your deployed URL
2. **Routing**: Test all pages:
   - `/` - Landing page
   - `/dashboard` - Main dashboard
   - `/about` - About page
   - `/blog` - Blog page
   - `/careers` - Careers page
   - `/help` - Help center
   - `/privacy` - Privacy policy
   - `/terms` - Terms of service
3. **API Connection**: Open browser DevTools → Network tab
   - Verify API requests go to `https://what-flow-backend.vercel.app/api`
   - Check for successful responses (200 status)
4. **Mobile Responsive**: Test on mobile devices
5. **Browser Compatibility**: Test on Chrome, Firefox, Safari, Edge

---

## Troubleshooting

### Issue: Blank Page After Deployment

**Solution**: Check browser console for errors. Common causes:
- Base URL configuration issue
- Missing environment variables
- CORS errors from backend

### Issue: 404 on Page Refresh

**Solution**: Ensure your hosting platform is configured for Single Page Application routing:
- **Vercel**: Automatic (no action needed)
- **Netlify**: Create `public/_redirects` file with: `/* /index.html 200`
- **Custom Server**: Configure rewrite rules (see above)

### Issue: API Calls Failing

**Solution**: 
1. Verify environment variables are set correctly
2. Check backend CORS configuration allows your domain
3. Ensure backend API is accessible from browsers

### Issue: Build Fails

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records as instructed

---

## Continuous Deployment (CI/CD)

Both Vercel and Netlify automatically deploy when you push to your Git repository:

1. **Connect Git Repository** to your hosting platform
2. **Push to main branch** → Automatic deployment
3. **Pull request previews** → Automatic preview deployments

---

## Performance Optimization

The app is already optimized with:
- ✅ Vite build optimization
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Lazy loading routes

For additional optimization:
- Enable caching headers on your hosting platform
- Use a CDN (both Vercel and Netlify provide this automatically)
- Monitor performance with Lighthouse

---

## Support

For deployment issues:
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Vite**: [vitejs.dev/guide](https://vitejs.dev/guide)

---

## Next Steps

After successful deployment:

1. ✅ Share the URL with your team
2. ✅ Test all functionality in production
3. ✅ Set up monitoring and analytics
4. ✅ Configure custom domain (optional)
5. ✅ Document merchant onboarding process
