# Environment Setup Guide

## Overview

This guide covers environment-specific configuration for development, staging, and production deployments, ensuring consistent and secure application behaviour across all environments.

## Environment Types

### Development Environment

- **Purpose**: Local development and testing
- **Database**: Local PostgreSQL or Docker container
- **Authentication**: Placeholder OAuth credentials allowed
- **Monitoring**: Console logging only
- **Security**: Relaxed for development convenience

### Staging Environment

- **Purpose**: Pre-production testing and validation
- **Database**: Separate staging database instance
- **Authentication**: Production-like OAuth setup
- **Monitoring**: Full monitoring enabled
- **Security**: Production-level security measures

### Production Environment

- **Purpose**: Live application serving real users
- **Database**: Production database with backups
- **Authentication**: Real OAuth credentials required
- **Monitoring**: Comprehensive monitoring and alerting
- **Security**: Maximum security configuration

## Environment Variables by Environment

### Development (.env.local)

```bash
# Environment
NODE_ENV=development

# Authentication (placeholders allowed)
AUTH_SECRET=dev-secret-min-8-chars
AUTH_DISCORD_ID=placeholder
AUTH_DISCORD_SECRET=placeholder

# Database (local)
DATABASE_URL=postgresql://postgres:password@localhost:5432/job-application-tracker

# NextAuth
NEXTAUTH_URL=http://localhost:3000

# Monitoring (optional)
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# Development flags
SKIP_ENV_VALIDATION=false
DISABLE_RATE_LIMITING=false
```

### Staging (.env.staging)

```bash
# Environment
NODE_ENV=production

# Authentication (real credentials)
AUTH_SECRET=staging-32-character-minimum-secret
AUTH_DISCORD_ID=staging-discord-client-id
AUTH_DISCORD_SECRET=staging-discord-client-secret

# Database (staging instance)
DATABASE_URL=postgresql://user:pass@staging-host:5432/jobtracker_staging?sslmode=require

# NextAuth
NEXTAUTH_URL=https://staging.your-app.com

# Monitoring
SENTRY_DSN=https://staging-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=job-tracker-staging

# Feature flags
ENABLE_DEBUG_LOGGING=true
RATE_LIMIT_REQUESTS=50
```

### Production (.env.production)

```bash
# Environment
NODE_ENV=production

# Authentication (production credentials)
AUTH_SECRET=production-32-character-minimum-secret-key
AUTH_DISCORD_ID=prod-discord-client-id
AUTH_DISCORD_SECRET=prod-discord-client-secret

# Database (production with SSL)
DATABASE_URL=postgresql://user:pass@prod-host:5432/jobtracker?sslmode=require&connection_limit=10

# NextAuth
NEXTAUTH_URL=https://your-app.com

# Monitoring
SENTRY_DSN=https://prod-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=job-tracker-prod

# Performance
RATE_LIMIT_REQUESTS=100
ENABLE_PERFORMANCE_MONITORING=true
```

## Database Configuration by Environment

### Development Database

```bash
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/job-application-tracker

# Docker PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/job-application-tracker

# Connection settings
- No SSL required
- Higher connection limits for development
- Query logging enabled
```

### Staging Database

```bash
# Separate staging database
DATABASE_URL=postgresql://staging_user:staging_pass@staging-db:5432/jobtracker_staging?sslmode=require

# Connection settings
- SSL required
- Production-like connection limits
- Query logging for debugging
- Automated backups
```

### Production Database

```bash
# Production database with optimisations
DATABASE_URL=postgresql://prod_user:secure_pass@prod-db:5432/jobtracker?sslmode=require&connection_limit=10&pool_timeout=10

# Connection settings
- SSL required and verified
- Strict connection limits
- Connection pooling enabled
- Automated backups and monitoring
- Read replicas (if needed)
```

## OAuth Configuration by Environment

### Development OAuth

```bash
# Discord Developer Portal settings
Application Name: Job Tracker (Dev)
Redirect URIs:
  - http://localhost:3000/api/auth/callback/discord
  - http://localhost:3001/api/auth/callback/discord

# Credentials can be shared across developers
AUTH_DISCORD_ID=dev-shared-client-id
AUTH_DISCORD_SECRET=dev-shared-client-secret
```

### Staging OAuth

```bash
# Separate staging application
Application Name: Job Tracker (Staging)
Redirect URIs:
  - https://staging.your-app.com/api/auth/callback/discord

# Staging-specific credentials
AUTH_DISCORD_ID=staging-client-id
AUTH_DISCORD_SECRET=staging-client-secret
```

### Production OAuth

```bash
# Production application
Application Name: Job Tracker
Redirect URIs:
  - https://your-app.com/api/auth/callback/discord
  - https://www.your-app.com/api/auth/callback/discord

# Production credentials (highly secure)
AUTH_DISCORD_ID=prod-client-id
AUTH_DISCORD_SECRET=prod-client-secret
```

## Security Configuration by Environment

### Development Security

```javascript
// Relaxed security for development
const securityConfig = {
  headers: {
    strictTransportSecurity: false, // No HSTS in development
    contentSecurityPolicy: "relaxed", // Allow unsafe-inline, unsafe-eval
  },
  rateLimiting: {
    enabled: true,
    requests: 1000, // Higher limits
    window: 15 * 60 * 1000,
  },
  authentication: {
    sessionMaxAge: 7 * 24 * 60 * 60, // 7 days
    secureCookies: false, // HTTP allowed
  },
};
```

### Staging Security

```javascript
// Production-like security
const securityConfig = {
  headers: {
    strictTransportSecurity: true,
    contentSecurityPolicy: "strict",
  },
  rateLimiting: {
    enabled: true,
    requests: 200, // Moderate limits
    window: 15 * 60 * 1000,
  },
  authentication: {
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
    secureCookies: true, // HTTPS required
  },
};
```

### Production Security

```javascript
// Maximum security
const securityConfig = {
  headers: {
    strictTransportSecurity: true,
    contentSecurityPolicy: "strict",
    additionalHeaders: ["X-Frame-Options", "X-Content-Type-Options"],
  },
  rateLimiting: {
    enabled: true,
    requests: 100, // Strict limits
    window: 15 * 60 * 1000,
    alerting: true,
  },
  authentication: {
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
    secureCookies: true,
    csrfProtection: true,
  },
};
```

## Monitoring Configuration by Environment

### Development Monitoring

```bash
# Minimal monitoring
LOG_LEVEL=debug
CONSOLE_LOGGING=true
SENTRY_ENABLED=false
PERFORMANCE_MONITORING=false

# Local debugging
ENABLE_QUERY_LOGGING=true
ENABLE_REQUEST_TRACING=true
```

### Staging Monitoring

```bash
# Full monitoring for testing
LOG_LEVEL=info
CONSOLE_LOGGING=true
SENTRY_ENABLED=true
PERFORMANCE_MONITORING=true

# Staging-specific Sentry project
SENTRY_DSN=https://staging-dsn@sentry.io/staging-project
SENTRY_ENVIRONMENT=staging
SENTRY_SAMPLE_RATE=0.5
```

### Production Monitoring

```bash
# Comprehensive monitoring
LOG_LEVEL=warn
CONSOLE_LOGGING=true
SENTRY_ENABLED=true
PERFORMANCE_MONITORING=true

# Production Sentry configuration
SENTRY_DSN=https://prod-dsn@sentry.io/prod-project
SENTRY_ENVIRONMENT=production
SENTRY_SAMPLE_RATE=0.1

# Additional monitoring
HEALTH_CHECK_ENABLED=true
METRICS_COLLECTION=true
ALERTING_ENABLED=true
```

## Deployment Strategies by Environment

### Development Deployment

```bash
# Local development
npm run dev

# Docker development
docker-compose -f docker-compose.dev.yml up

# Features
- Hot reload enabled
- Source maps included
- Debug information available
- Relaxed error handling
```

### Staging Deployment

```bash
# Automated staging deployment
git push origin staging

# CI/CD Pipeline:
1. Run tests
2. Build application
3. Deploy to staging environment
4. Run integration tests
5. Notify team of deployment

# Features
- Production build
- Database migrations
- Smoke tests
- Performance testing
```

### Production Deployment

```bash
# Production deployment process
git push origin main

# CI/CD Pipeline:
1. Run full test suite
2. Security scanning
3. Build optimized application
4. Deploy with zero downtime
5. Run health checks
6. Monitor for issues
7. Rollback if needed

# Features
- Optimized build
- Database migrations
- Health checks
- Monitoring alerts
- Rollback capability
```

## Environment Validation

### Validation Rules by Environment

```typescript
// Development validation (relaxed)
const devValidation = {
  AUTH_SECRET: z.string().min(8),
  AUTH_DISCORD_ID: z.string(), // Allows placeholders
  DATABASE_URL: z.string().url(),
};

// Staging validation (strict)
const stagingValidation = {
  AUTH_SECRET: z.string().min(32),
  AUTH_DISCORD_ID: z.string().refine((val) => val !== "placeholder"),
  DATABASE_URL: z
    .string()
    .url()
    .refine((url) => url.includes("sslmode=require")),
};

// Production validation (maximum)
const productionValidation = {
  AUTH_SECRET: z.string().min(32).refine(isSecureSecret),
  AUTH_DISCORD_ID: z.string().refine((val) => val !== "placeholder"),
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (url) =>
        url.includes("sslmode=require") && url.includes("connection_limit"),
    ),
};
```

## Environment Switching

### Local Environment Switching

```bash
# Switch to staging environment
cp .env.staging .env.local
npm run dev

# Switch to production environment (for testing)
cp .env.production .env.local
npm run build && npm start
```

### CI/CD Environment Management

```yaml
# GitHub Actions environment management
name: Deploy
on:
  push:
    branches: [main, staging, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set environment variables
        run: |
          if [[ $GITHUB_REF == 'refs/heads/main' ]]; then
            echo "ENVIRONMENT=production" >> $GITHUB_ENV
            echo "DATABASE_URL=${{ secrets.PROD_DATABASE_URL }}" >> $GITHUB_ENV
          elif [[ $GITHUB_REF == 'refs/heads/staging' ]]; then
            echo "ENVIRONMENT=staging" >> $GITHUB_ENV
            echo "DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }}" >> $GITHUB_ENV
          else
            echo "ENVIRONMENT=development" >> $GITHUB_ENV
            echo "DATABASE_URL=${{ secrets.DEV_DATABASE_URL }}" >> $GITHUB_ENV
          fi
```

## Best Practices

### Environment Isolation

- **Separate databases**: Never share databases between environments
- **Separate OAuth apps**: Use different OAuth applications per environment
- **Separate monitoring**: Use different Sentry projects per environment
- **Separate secrets**: Never reuse production secrets in other environments

### Configuration Management

- **Environment-specific files**: Use separate .env files for each environment
- **Secret management**: Use secure secret management systems in production
- **Validation**: Validate environment variables at startup
- **Documentation**: Keep environment documentation up to date

### Security Considerations

- **Least privilege**: Grant minimum necessary permissions
- **Secret rotation**: Regularly rotate secrets and credentials
- **Access control**: Limit access to production environments
- **Audit logging**: Log all environment changes and access

### Monitoring and Alerting

- **Environment tagging**: Tag all monitoring data with environment
- **Separate alerting**: Use different alert thresholds per environment
- **Health checks**: Implement environment-specific health checks
- **Performance baselines**: Establish performance baselines per environment
