# Database Connection Pooling

## Overview

Prisma automatically manages connection pooling with sensible defaults. Most applications don't need explicit configuration.

**Default behaviour:**

- Pool size: `num_physical_cpus * 2 + 1` (typically 5-10 connections)
- Automatic connection reuse
- Idle connection cleanup

## When to Configure

Configure explicit pooling if you experience:

- ❌ "Too many connections" errors
- ❌ Connection timeouts in serverless environments
- ❌ Database connection limit warnings (free tier limits)

## Deployment Scenarios

### Local Development & Traditional Servers

**No configuration needed.** Defaults work well.

```typescript
// Current setup in src/server/db.ts works perfectly
const prisma = new PrismaClient();
```

### Serverless (Vercel, AWS Lambda, Netlify)

**Problem:** Each function instance creates its own connection pool, quickly exhausting database limits.

#### **Solution 1: Limit connections per function**

Add parameters to your `DATABASE_URL`:

```bash
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10"
```

#### **Solution 2: Use external connection pooler (Recommended)**

Use PgBouncer, Supabase Pooler, or Neon's built-in pooling:

```bash
# Supabase
DATABASE_URL="postgresql://user:pass@pooler.supabase.com:6543/db?pgbouncer=true"

# Neon (automatically pooled)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db"
```

### Database Free Tier Limits

Common connection limits:

- **Supabase Free:** 60 connections
- **Neon Free:** 100 connections
- **Railway Free:** 20 connections
- **PlanetScale:** 1,000 connections

**Recommended limits for serverless:**

```bash
# Conservative (recommended)
DATABASE_URL="postgresql://...?connection_limit=3&pool_timeout=10"

# Moderate
DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=15"
```

## Connection Pool Parameters

Add to your `DATABASE_URL` query string:

| Parameter          | Description                       | Default            | Recommended          |
| ------------------ | --------------------------------- | ------------------ | -------------------- |
| `connection_limit` | Max connections per Prisma Client | `num_cpus * 2 + 1` | `3-5` for serverless |
| `pool_timeout`     | Seconds to wait for connection    | `10`               | `10-20`              |
| `connect_timeout`  | Seconds to establish connection   | `5`                | `10-30`              |

**Example:**

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=20&connect_timeout=30"
```

## External Connection Poolers

For production serverless applications, use an external pooler:

### PgBouncer (Self-hosted)

```bash
# Install via Docker
docker run -d \
  -p 6432:6432 \
  -e DATABASE_URL="postgresql://..." \
  pgbouncer/pgbouncer

# Update your DATABASE_URL
DATABASE_URL="postgresql://user:pass@localhost:6432/db?pgbouncer=true"
```

### Supabase Pooler

```bash
# Use pooler endpoint (port 6543)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Neon

```bash
# Neon automatically pools connections
# No configuration needed
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db"
```

## Monitoring Connection Usage

### Check Active Connections (PostgreSQL)

```sql
SELECT count(*) FROM pg_stat_activity;
```

### Check Connection Limit

```sql
SHOW max_connections;
```

### Prisma Logging

Enable query logging to monitor connection behavior:

```typescript
// src/server/db.ts
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

## Troubleshooting

### "Too many connections" Error

**Symptoms:**

```text
Error: P1001: Can't reach database server
Error: remaining connection slots are reserved
```

**Solutions:**

1. Reduce `connection_limit` in DATABASE_URL
2. Use external connection pooler
3. Upgrade database plan
4. Close idle connections in your code

### Connection Timeouts

**Symptoms:**

```text
Error: P1001: Timed out fetching a new connection
```

**Solutions:**

1. Increase `pool_timeout` parameter
2. Increase `connect_timeout` parameter
3. Check database server health
4. Verify network connectivity

### Slow Queries Blocking Pool

**Symptoms:**

- Requests waiting for connections
- High pool timeout errors

**Solutions:**

1. Optimize slow queries
2. Add database indexes
3. Increase `pool_timeout`
4. Increase `connection_limit`

## Best Practices

### ✅ Do

- Use external poolers for serverless production apps
- Monitor connection usage in production
- Set conservative limits for free tier databases
- Test connection limits before deploying

### ❌ Don't

- Don't create multiple PrismaClient instances
- Don't set `connection_limit` too low (< 2)
- Don't ignore "too many connections" warnings
- Don't use large pools in serverless environments

## Environment-Specific Configuration

```bash
# .env.development (local)
DATABASE_URL="postgresql://postgres:password@localhost:5432/dev"

# .env.production (serverless)
DATABASE_URL="postgresql://user:pass@host:5432/prod?connection_limit=5&pool_timeout=10"

# .env.production (with pooler - recommended)
DATABASE_URL="postgresql://user:pass@pooler.host:6543/prod?pgbouncer=true"
```

## Further Reading

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Prisma in Serverless Environments](https://www.prisma.io/docs/guides/deployment/deployment-guides/serverless)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
