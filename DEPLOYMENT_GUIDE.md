# Akash Portfolio - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the KUPURI MEDIA™ ecosystem to Vercel.

## Pre-Deployment Checklist

Before deploying, ensure:

1. All changes are committed and pushed to `claude/execute-skill-installation-OGkgi` branch
2. All tests in `TESTING_CHECKLIST.md` pass
3. No console errors or warnings
4. Environment variables are configured
5. Vercel configuration (`vercel.json`) is correct

## Deployment Steps

### 1. Verify Vercel Configuration

Check that `apps/web/vercel.json` contains proper rewrites, redirects, and security headers.

### 2. Build & Test Locally

```bash
# Navigate to web app directory
cd apps/web

# Install dependencies (if needed)
npm install

# Build the application
npm run build

# Test the build locally
npm run preview
```

### 3. Push to Git

```bash
cd /home/user/AKASHPORTFOLIO

# Check status
git status

# Add any uncommitted files
git add -A

# Create final commit if needed
git commit -m "build(web): Prepare for production deployment"

# Push to the feature branch
git push origin claude/execute-skill-installation-OGkgi
```

### 4. Deploy to Vercel

#### Using Vercel CLI:
```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

#### Using GitHub Integration (Recommended):
1. Push changes to configured deploy branch
2. Vercel automatically detects the push
3. Vercel builds and deploys automatically

### 5. Verify Deployment

Visit deployed site and verify:
- [ ] Home page loads
- [ ] Work portfolio loads
- [ ] About page loads
- [ ] All navigation works
- [ ] Images load properly
- [ ] Mobile responsive

## Monitoring & Health Checks

- Monitor deployment status in Vercel Dashboard
- Check Core Web Vitals
- Review production logs for errors
- Test all critical pages

## Rollback Procedures

If issues occur:

1. In Vercel Dashboard, go to "Deployments"
2. Find previous working deployment
3. Click deployment and "Promote to Production"

Or via Git:
```bash
git revert HEAD
git push origin main
```

## Post-Deployment Tasks

1. Update DNS records (if using custom domain)
2. Verify SSL certificate (auto-provided by Vercel)
3. Monitor performance metrics
4. Setup notifications (Slack, Discord, email)
5. Test all functionality on deployed site

## Environment Variables

Set in Vercel Project Settings:

```
NEXT_PUBLIC_SYNTHIA_API_URL=https://synthia.kupuri.local/api
NEXT_PUBLIC_SYNTHIA_API_KEY=your-api-key-here
```

## Troubleshooting

### Build Failures
- Check Vercel build logs
- Ensure `npm run build` works locally
- Verify all dependencies installed

### Pages Not Found (404)
- Verify Vercel rewrites in vercel.json
- Check file paths are correct
- Clear cache and redeploy

### Images Not Loading
- Verify image paths are relative
- Check image files exist
- Clear browser cache

---

**Status**: Ready for Production
**Last Updated**: 2026-04-21
