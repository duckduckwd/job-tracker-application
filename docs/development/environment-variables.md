# Environment Variables Guide

## Overview

This application uses environment variables for configuration. Variables are validated at startup using T3 env with Zod schemas.

## Environment Files

### `.env.local` (Development)

Used for local development. Never commit this file.

### `.env.example` (Template)

Template file showing required variables. Safe to commit.

### `.env` (Production)

Used in production deployments. Never commit this file.

## Required Variables

### Authentication

```bash
# NextAuth.js secret key
# Generate with: npx auth secret
AUTH_SECRET="your-generated-secret-here"

# Discord OAuth credentials
# Get from: https://discord.com/developers/applications
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
```

### Database

```bash
# PostgreSQL connection string
# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/job-application-tracker"

# Production example
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

### Monitoring (Optional)

```bash
# Sentry error tracking
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
SENTRY_ORG="your-org-name"
SENTRY_PROJECT="your-project-name"
```

## Environment-Specific Configuration

### Development

```bash
NODE_ENV="development"
AUTH_SECRET="dev-secret-min-8-chars"
AUTH_DISCORD_ID="placeholder"  # Will be validated as placeholder
AUTH_DISCORD_SECRET="placeholder"  # Will be validated as placeholder
DATABASE_URL="postgresql://postgres:password@localhost:5432/job-application-tracker"
```

### Production

```bash
NODE_ENV="production"
AUTH_SECRET="secure-32-character-minimum-secret"  # Must be 32+ chars
AUTH_DISCORD_ID="real-discord-client-id"  # Cannot be placeholder
AUTH_DISCORD_SECRET="real-discord-secret"  # Cannot be placeholder
DATABASE_URL="postgresql://user:pass@prod-host:5432/db?sslmode=require"
```

## Validation Rules

### AUTH_SECRET

- **Development**: Minimum 8 characters
- **Production**: Minimum 32 characters
- **Cannot be**: Empty or undefined

### AUTH_DISCORD_ID / AUTH_DISCORD_SECRET

- **Cannot be**: "placeholder", "test-discord-id", "test-discord-secret"
- **Must be**: Valid Discord OAuth credentials

### DATABASE_URL

- **Must be**: Valid PostgreSQL URL format
- **Cannot contain**: Weak passwords like "password@"
- **Should include**: SSL mode for production

## Getting OAuth Credentials

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 section
4. Copy Client ID and Client Secret
5. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`

### Production Redirect URLs

Add these for production:

- `https://your-domain.com/api/auth/callback/discord`

## Security Best Practices

### Local Development

- Use placeholder values for OAuth during initial setup
- Never commit real credentials to version control
- Use strong AUTH_SECRET even in development

### Production

- Use environment variable injection (Vercel, Railway, etc.)
- Enable SSL for database connections
- Rotate secrets regularly
- Monitor for credential leaks

## Validation Errors

### Common Error Messages

```bash
# AUTH_SECRET too short in production
"AUTH_SECRET must be at least 32 characters in production"

# Placeholder values in production
"AUTH_DISCORD_ID cannot be placeholder value"

# Invalid database URL
"DATABASE_URL should not contain weak passwords"
```

### Fixing Validation Errors

1. Check error message for specific requirement
2. Update `.env.local` with correct values
3. Restart development server
4. Verify with health check: `curl http://localhost:3000/api/health`

## Environment Variable Loading Order

Next.js loads environment variables in this order:

1. `.env.local` (always loaded, ignored by git)
2. `.env.development` or `.env.production` (based on NODE_ENV)
3. `.env` (fallback)

## Testing Environment Variables

### Test Configuration

Create `.env.test` for testing:

```bash
AUTH_SECRET="test-secret-key"
AUTH_DISCORD_ID="test-discord-id"
AUTH_DISCORD_SECRET="test-discord-secret"
DATABASE_URL="postgresql://postgres:password@localhost:5432/job-application-tracker-test"
```

### Validation in Tests

Environment validation is automatically loaded in tests. Use `SKIP_ENV_VALIDATION=true` to bypass validation if needed.

## Troubleshooting

### Variable Not Loading

1. Check file name (`.env.local` not `.env.local.txt`)
2. Restart development server
3. Verify no spaces around `=` sign
4. Check for quotes around values with spaces

### Validation Failing

1. Check exact error message
2. Verify variable format matches requirements
3. Ensure no trailing whitespace
4. Test with minimal valid values first
