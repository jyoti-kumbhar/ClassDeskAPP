# ClassDesk — Web Deployment Guide (Phase 12)

This document provides step-by-step instructions for deploying the production web version of ClassDesk across modern static hosting platforms with SSL/HTTPS.

---

## 1. Web Architecture Overview

- **Bundler**: Metro for Expo Web (`expo export -p web`)
- **Output Directory**: `dist/`
- **Routing**: Single Page Application (SPA) with fallback to `index.html`
- **Auth & Storage**: Connected to the same Supabase backend as the Android application (`localStorage` session persistence)

---

## 2. Environment Variables

When deploying to any cloud host, configure the following Environment Variables in your hosting dashboard:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | Your production Supabase project URL | `https://xyzcompany.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your public Supabase anon key | `eyJhbGciOi...` |

> [!CAUTION]
> **Security Reminder**: Never expose the Supabase `service_role` key in frontend environment variables. Only use the public `anon` key.

---

## 3. Hosting Platform Guides

### Deploying to Vercel

1. Import your ClassDesk repository into [Vercel](https://vercel.com).
2. The included [`vercel.json`](./vercel.json) will automatically configure:
   - Build Command: `npm run build:web`
   - Output Directory: `dist`
   - SPA URL rewrites to `/index.html`
   - Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
3. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in **Project Settings -> Environment Variables**.
4. Click **Deploy**.

---

### Deploying to Netlify

1. Connect your repository to [Netlify](https://netlify.com).
2. The included [`netlify.toml`](./netlify.toml) automatically configures:
   - Build Command: `npm run build:web`
   - Publish Directory: `dist`
   - SPA 200 redirect rule (`/* -> /index.html`)
   - Production security headers
3. Add your environment variables under **Site configuration -> Environment variables**.
4. Trigger deploy.

---

### Deploying to Cloudflare Pages

1. Connect your repository to [Cloudflare Pages](https://pages.cloudflare.com).
2. Set **Build command**: `npm run build:web`
3. Set **Build output directory**: `dist`
4. Under Environment variables, add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
5. Save and Deploy.

---

## 4. Web Production Checklist (Phase 12 Requirements)

- [x] **Production Supabase connection**: Seamless Auth and PostgreSQL queries
- [x] **Correct environment variables**: Validated via `isLiveSupabaseConfigured()`
- [x] **HTTPS / SSL**: Enforced by default on Vercel/Netlify/Cloudflare
- [x] **Responsive UI**: Adapts smoothly from mobile screens to wide desktop monitors
- [x] **Cross-platform Auth**: Persistent session using browser `localStorage`
- [x] **File uploads**: Native HTML5 file input with size (25MB) and whitelist validation
- [x] **Production error handling**: User-friendly, sanitized errors without server leakage
