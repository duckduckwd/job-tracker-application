# Vercel Deployment Guide

## Overview

Vercel is the recommended deployment platform for this Next.js application, offering seamless integration, automatic deployments, and generous free tier limits.

## Prerequisites

### Required Accounts

- **GitHub Account**: For repository hosting
- **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
- **Database Provider**: Supabase, Railway, or Neon (PostgreSQL)
- **Sentry Account**: For error tracking (optional)

### Repository Setup

```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Vercel Project Setup

### 1. Import Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select "job-application-tracker" repository

### 2. Configure Build Settings

Vercel automatically detects Next.js projects, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (automatic)
- **Install Command**: `npm install`

### 3. Environment Variables

Add all required environment variables in Vercel dashboard:

```bash
# Authentication
AUTH_SECRET="your-32-character-production-secret"
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Monitoring (Optional)
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
SENTRY_ORG="your-org-name"
SENTRY_PROJECT="your-project-name"

# Vercel-specific
NEXTAUTH_URL="https://your-app.vercel.app"
```

## Database Setup

### Option 1: Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Add to Vercel environment variables

```bash
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres?sslmode=require"
```

### Option 2: Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from Variables tab

```bash
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/railway?sslmode=require"
```

### Option 3: Neon

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard

```bash
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

## OAuth Configuration

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to OAuth2 → General
4. Add redirect URI: `https://your-app.vercel.app/api/auth/callback/discord`
5. Save changes

### Production URLs

Update OAuth providers with production URLs:

- **Development**: `http://localhost:3000/api/auth/callback/discord`
- **Production**: `https://your-app.vercel.app/api/auth/callback/discord`

## Deployment Process

### 1. Initial Deployment

```bash
# Deploy from Vercel dashboard
1. Click "Deploy" button
2. Wait for build to complete
3. Check deployment logs for errors
4. Visit deployed URL
```

### 2. Database Migration

```bash
# Run database migrations after first deployment
npx prisma migrate deploy

# Or push schema (for development)
npx prisma db push
```

### 3. Verify Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Expected response
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy" },
    "environment": { "status": "healthy" }
  }
}
```

## Automatic Deployments

### Git Integration

Vercel automatically deploys when you push to GitHub:

- **Main branch**: Production deployment
- **Other branches**: Preview deployments
- **Pull requests**: Preview deployments with unique URLs

### Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects push to main branch
# 2. Starts new deployment
# 3. Runs build process
# 4. Deploys to production
# 5. Sends notification
```

## Environment Management

### Production Environment Variables

```bash
# Required for production
NODE_ENV="production"
AUTH_SECRET="32-character-minimum-production-secret"
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
NEXTAUTH_URL="https://your-app.vercel.app"

# OAuth credentials (real values, not placeholders)
AUTH_DISCORD_ID="real-discord-client-id"
AUTH_DISCORD_SECRET="real-discord-client-secret"

# Optional monitoring
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
```

### Environment Variable Management

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add/edit variables
5. Redeploy to apply changes

## Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 2. DNS Configuration

```bash
# Add these DNS records to your domain provider
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

### 3. Update OAuth Redirects

Update Discord OAuth settings with new domain:

```bash
https://yourdomain.com/api/auth/callback/discord
```

## Performance Optimisation

### Vercel Configuration

```javascript
// vercel.json (optional)
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

### Build Optimisation

```javascript
// next.config.js optimisations
const config = {
  // Enable compression
  compress: true,

  // Optimize images
  images: {
    domains: ["cdn.discordapp.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === "true" && {
    webpack: (config) => {
      config.plugins.push(new BundleAnalyzerPlugin());
      return config;
    },
  }),
};
```

## Monitoring and Logging

### Vercel Analytics

1. Go to project dashboard
2. Enable Vercel Analytics
3. View performance metrics

### Function Logs

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow

# Filter by time
vercel logs --since=1h
```

### Error Tracking

Sentry automatically captures errors in production:

- Deployment errors
- Runtime exceptions
- Performance issues
- User-reported issues

## Troubleshooting

### Common Deployment Issues

#### **Build Failures**

```bash
# Check build logs in Vercel dashboard
# Common issues:
- TypeScript errors
- Missing environment variables
- Dependency conflicts
- Memory limits exceeded
```

#### **Environment Variable Issues**

```bash
# Verify variables are set correctly
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure no trailing spaces
3. Verify variable names match exactly
4. Redeploy after changes
```

#### **Database Connection Issues**

```bash
# Test database connection
npx prisma db push

# Check connection string format
postgresql://user:pass@host:5432/db?sslmode=require

# Verify SSL requirements
```

#### **OAuth Callback Errors**

```bash
# Verify redirect URIs match exactly
Production: https://your-app.vercel.app/api/auth/callback/discord
Preview: https://preview-url.vercel.app/api/auth/callback/discord

# Check OAuth credentials are production values
```

### Debug Mode

```bash
# Enable debug logging in production
NEXTAUTH_DEBUG=true

# View detailed logs in Vercel dashboard
```

## Rollback Procedures

### Rollback to Previous Deployment

1. Go to Vercel dashboard
2. Select Deployments tab
3. Find previous successful deployment
4. Click "Promote to Production"

### Emergency Rollback

```bash
# Using Vercel CLI
vercel --prod --force

# Rollback to specific deployment
vercel promote [deployment-url] --scope=team
```

## Security Considerations

### Production Security Checklist

- [ ] AUTH_SECRET is 32+ characters
- [ ] Database uses SSL connections
- [ ] OAuth redirects use HTTPS
- [ ] Environment variables are secure
- [ ] Sentry DSN is configured
- [ ] Custom domain uses HTTPS
- [ ] Security headers are enabled

### Vercel Security Features

- **Automatic HTTPS**: SSL certificates managed automatically
- **DDoS Protection**: Built-in protection against attacks
- **Edge Network**: Global CDN for performance and security
- **Environment Isolation**: Secure environment variable handling

## Scaling Considerations

### Vercel Limits (Free Tier)

- **Bandwidth**: 100GB per month
- **Function Executions**: 100GB-hours per month
- **Function Duration**: 10 seconds max
- **Build Minutes**: 6,000 minutes per month

### Upgrade Triggers

Consider upgrading when you exceed:

- Monthly bandwidth limits
- Function execution limits
- Need longer function timeouts
- Require team collaboration features

## Maintenance

### Regular Tasks

- **Monitor usage**: Check Vercel dashboard monthly
- **Update dependencies**: Keep packages current
- **Review logs**: Check for errors and performance issues
- **Test deployments**: Verify functionality after updates

### Automated Maintenance

```bash
# Set up GitHub Actions for dependency updates
# .github/workflows/update-deps.yml
name: Update Dependencies
on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm update
      - run: npm audit fix
```
