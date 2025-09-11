# KOR Website

A modern, responsive website for KOR with comprehensive testing and deployment automation.

## Features

- Responsive design optimized for all devices
- Enhanced accessibility features
- Performance optimizations
- Comprehensive testing suite
- Automated CI/CD pipeline

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build:prod
```

## Deployment

The site is automatically deployed to production when changes are pushed to the main branch via GitHub Actions.

Last deployment test: 2025-08-05 22:09 - Base64 SSH key encoding implemented

---

## React App (kor-react) — Build & Deploy

This repo includes a Create React App project at `kor-react/` that powers the new website.

### Prerequisites
- Local:
  - Node 18+ and npm
  - SSH access to the server (key-based recommended)
  - rsync (recommended) or sftp available locally
- Server (jmrcycling.com):
  - Nginx serving `/var/www/jmrcycling.com`
  - SPA fallback configured (see `nginx.conf.sample`)

### Environment variables (production)
Create `kor-react/.env.production` with public client-side variables:

```ini path=/Users/masontuft/Documents/GitHub/KOR/kor-react/.env.production start=1
# All REACT_APP_* values are embedded in the client bundle and are public.
REACT_APP_ENVIRONMENT=production

# Canonical site URL
REACT_APP_SITE_URL=https://jmrcycling.com

# Forms
REACT_APP_FORMSPREE_ID=myyvklzv

# Auth0 (public client values)
REACT_APP_AUTH0_DOMAIN=dev-oseu3r74.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=BIiXW01dEohpU5qLM6FTEbBUYDVFUo7v
# REACT_APP_AUTH0_AUDIENCE= # Optional; only if calling protected APIs

# Chargebee (client-side keys)
REACT_APP_CHARGEBEE_SITE=jmrcycling
REACT_APP_CHARGEBEE_PUBLISHABLE_KEY=pk_XXXXXXXXXXXXXXXXXXXXXXXX

# Analytics (optional)
# REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
```

Notes:
- Do not place server-side secrets in React env files. Only use publishable/public client keys.
- The publishable key can be retrieved from Chargebee Dashboard → Settings → API Keys.

### One-command deploy
From the repo root:

```bash path=null start=null
chmod +x ./deploy-react.sh   # one-time
./deploy-react.sh            # builds kor-react and deploys build/ to the server
```

Options:

```bash path=null start=null
REMOTE_HOST=user@host REMOTE_WEBROOT=/var/www/jmrcycling.com ./deploy-react.sh
```

What the script does:
- Builds the CRA app in `kor-react/` using `.env.production`.
- Syncs the `build/` folder to `/var/www/jmrcycling.com` via rsync (with `--delete`).
- Preserves and updates the legacy static page `oauth/authorize/index.html`.
- Falls back to sftp if rsync is unavailable.

### Nginx configuration
A sample config is provided at `nginx.conf.sample`.
- Adds SPA fallback: `try_files $uri /index.html`.
- Adds 301 redirects from legacy `.html` pages (e.g., `/our_app.html`) to the new React routes (e.g., `/our-app`).
- Sets long-cache headers for static assets.

Apply on the server (example):

```bash path=null start=null
sudo cp nginx.conf.sample /etc/nginx/sites-available/jmrcycling.conf
sudo ln -sfn /etc/nginx/sites-available/jmrcycling.conf /etc/nginx/sites-enabled/jmrcycling.conf
sudo nginx -t && sudo systemctl reload nginx
```

### Post-deploy checks
- https://jmrcycling.com/
- https://jmrcycling.com/qr-guide
- https://jmrcycling.com/shop/login
- https://jmrcycling.com/oauth/authorize/ (legacy static page)
- Verify Formspree submissions on Contact/FAQ.
- Verify GA pageviews (if GA ID configured) and Auth0 flows (if audience configured).

### Troubleshooting
- Chargebee publishable key missing in production:
  - Ensure `REACT_APP_CHARGEBEE_PUBLISHABLE_KEY` is set in `.env.production`.
- SPA routes return 404 on refresh:
  - Ensure nginx uses `try_files $uri /index.html`.
- Old assets appear after deploy:
  - Ensure rsync is used (script default) and not sftp; rsync cleans stale files with `--delete`.
