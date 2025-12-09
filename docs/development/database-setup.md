# Database Setup Guide

## Overview

This application uses PostgreSQL with Prisma ORM for type-safe database operations.

## Local Development Setup

### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d

# Check container status
docker ps

# View logs
docker-compose logs db
```

### Option 2: Local PostgreSQL Installation

```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb job-application-tracker

# Create user (optional)
createuser -s postgres
```

## Database Configuration

### Connection String Format

```bash
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?[options]"
```

### Local Development

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/job-application-tracker"
```

### Production Examples

```bash
# Supabase
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres?sslmode=require"

# Railway
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/railway?sslmode=require"

# Neon
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

## Prisma Commands

### Schema Management

```bash
# Generate Prisma client and create migration
npm run db:generate

# Push schema to database (development only)
npm run db:push

# Apply migrations to production
npm run db:migrate

# Seed database with initial data
npm run db:seed

# Reset database (development only)
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Custom Client Location

This project uses a custom Prisma client location (`../generated/prisma`) instead of the default `@prisma/client`. Import the client like this:

```typescript
import { PrismaClient } from "../generated/prisma";
```

## Schema Overview

### Current Tables

- **User** - NextAuth.js user accounts
- **Account** - OAuth account connections
- **Session** - User sessions
- **VerificationToken** - Email verification tokens

### Future Tables (Job Tracking)

- **JobApplication** - Job applications with status tracking
- **Contact** - Company contacts and recruiters
- **Interview** - Interview scheduling and notes

## Database Migrations

### Development Workflow

```bash
# 1. Modify schema in prisma/schema.prisma
# 2. Generate migration and update client
npm run db:generate

# 3. Seed database if needed
npm run db:seed

# 4. View data in Prisma Studio
npm run db:studio
```

### Production Deployment

```bash
# Apply migrations to production
npm run db:migrate
```

## Connection Pooling

Prisma automatically manages connection pooling with sensible defaults.

**For detailed information on connection pooling configuration, see:**

- [Connection Pooling Guide](../database/connection-pooling.md)

### Quick Reference

**Development:** No configuration needed.

**Production (Serverless):** Add connection limits to DATABASE_URL:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10"
```

**Production (Recommended):** Use external connection pooler:

```bash
# Supabase Pooler
DATABASE_URL="postgresql://user:pass@pooler.supabase.com:6543/db?pgbouncer=true"

# Neon (automatically pooled)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db"
```

## Backup and Restore

### Local Backup

```bash
# Backup database
pg_dump job-application-tracker > backup.sql

# Restore database
psql job-application-tracker < backup.sql
```

### Production Backup

Use your hosting provider's backup tools:

- **Supabase**: Automatic backups in dashboard
- **Railway**: Database backups in project settings
- **Neon**: Point-in-time recovery available

## Performance Optimisation

### Indexing

Key indexes are defined in schema:

```prisma
model JobApplication {
  id     String @id @default(cuid())
  userId String

  @@index([userId])
  @@index([status])
  @@index([appliedDate])
}
```

### Query Optimisation

```typescript
// Use select to limit fields
const jobs = await db.jobApplication.findMany({
  select: {
    id: true,
    company: true,
    position: true,
    status: true,
  },
});

// Use include for relations
const jobWithContacts = await db.jobApplication.findUnique({
  where: { id },
  include: {
    contacts: true,
    interviews: true,
  },
});
```

## Troubleshooting

### Connection Issues

```bash
# Check if PostgreSQL is running
docker ps  # For Docker
brew services list | grep postgresql  # For Homebrew

# Test connection
psql "postgresql://postgres:password@localhost:5432/job-application-tracker"
```

### Migration Errors

```bash
# Reset migrations (development only)
npm run db:reset

# Force push schema (development only)
npm run db:push -- --force-reset

# Check migration status
npx prisma migrate status
```

### Schema Sync Issues

```bash
# Pull current database schema
npx prisma db pull

# Generate new client (regenerates to ../generated/prisma)
npx prisma generate

# Restart development server
npm run dev
```

### Permission Errors

```bash
# Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE "job-application-tracker" TO postgres;

# Or create superuser
CREATE USER postgres WITH SUPERUSER PASSWORD 'password';
```

## Security Considerations

### Development

- Use strong passwords even locally
- Don't expose database ports publicly
- Regular backups of development data

### Production

- Enable SSL connections (`sslmode=require`)
- Use connection pooling
- Regular security updates
- Monitor for unusual query patterns
- Implement proper access controls

## Monitoring

### Query Logging

Enable in production for performance monitoring:

```typescript
const db = new PrismaClient({
  log: ["query", "error", "warn"],
});
```

### Performance Metrics

Monitor these metrics:

- Connection pool usage
- Query execution time
- Database size growth
- Index usage statistics

## Environment-Specific Setup

### Development

- Local PostgreSQL or Docker
- Full query logging enabled
- Prisma Studio for debugging

### Staging

- Separate database instance
- Production-like configuration
- Migration testing environment

### Production

- Managed database service
- Connection pooling enabled
- Automated backups configured
- Monitoring and alerting setup
