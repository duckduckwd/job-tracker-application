# Database Documentation

## Overview

PostgreSQL database with Prisma ORM for type-safe database access. Currently configured for authentication with planned job application data models.

## Quick Start

### Local Development Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Push schema to database
npm run db:push

# Open Prisma Studio (optional)
npm run db:studio

# Seed database (optional)
npm run db:seed
```

### Production Setup

```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

## Database Configuration

### Connection Details

- **Engine**: PostgreSQL 15+
- **ORM**: Prisma with custom output location
- **Connection**: Environment variable `DATABASE_URL`
- **Client Location**: `generated/prisma/` (custom path)

### Environment Variables

```bash
# Development
DATABASE_URL="postgresql://postgres:password@localhost:5432/job_tracker_dev"

# Production (example)
DATABASE_URL="postgresql://user:pass@host:5432/job_tracker_prod"
```

## Current Schema

### Authentication (NextAuth.js)

- **User**: User accounts and profiles
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

### Placeholder Models

- **Post**: Example model (will be removed)

### Planned Models

- **JobApplication**: Main application data (not yet implemented)

## Documentation

### [Schema Design](./schema-design.md)

- Current authentication models
- Planned job application schema
- Migration strategy and data types

### [Connection Pooling](./connection-pooling.md)

- Prisma connection management
- Serverless deployment considerations
- Performance optimization

## Common Commands

### Development

```bash
# Database operations
npm run db:push          # Push schema changes (development)
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Run seed script
npm run db:reset         # Reset database and run migrations

# Schema operations
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and run migration
```

### Production

```bash
# Deployment
npm run db:migrate       # Run pending migrations
npm run postinstall      # Generate client (automatic)
```

## Schema Status

| Model                 | Status         | Purpose                       |
| --------------------- | -------------- | ----------------------------- |
| **User**              | ✅ Production  | NextAuth.js user accounts     |
| **Account**           | ✅ Production  | OAuth provider accounts       |
| **Session**           | ✅ Production  | User session management       |
| **VerificationToken** | ✅ Production  | Email verification            |
| **Post**              | 🗑️ Placeholder | Example model (to be removed) |
| **JobApplication**    | 📋 Planned     | Main application data         |

## Migration History

### Current Migrations

- Initial NextAuth.js schema setup
- Custom Prisma client output location

### Planned Migrations

- Remove Post model
- Add JobApplication model with full form fields
- Add performance indexes

## Performance Considerations

### Indexes

- User relationships indexed
- Common query patterns optimized
- Full-text search ready for company names

### Connection Management

- Prisma automatic connection pooling
- Serverless-optimized configuration
- Connection limit monitoring

## Security Features

### Data Protection

- Row-level security by user ID
- Encrypted connections (SSL)
- No sensitive data in logs

### Access Control

- All queries filtered by authenticated user
- No cross-user data access
- Audit trail for data changes

## Backup Strategy

### Development

- Docker volume persistence
- Local database dumps

### Production

- Automated daily backups
- Point-in-time recovery
- Cross-region replication (recommended)

## Troubleshooting

### Common Issues

**Connection Errors**

```bash
# Check database is running
docker-compose ps

# Verify connection string
echo $DATABASE_URL
```

**Schema Sync Issues**

```bash
# Reset development database
npm run db:reset

# Push schema changes
npm run db:push
```

**Migration Conflicts**

```bash
# Check migration status
npx prisma migrate status

# Resolve conflicts
npx prisma migrate resolve --applied "migration_name"
```

## Next Steps

1. **Implement JobApplication model** based on form schema
2. **Remove Post placeholder** model
3. **Add performance indexes** for common queries
4. **Set up production backups** and monitoring

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NextAuth.js Database Adapters](https://next-auth.js.org/adapters/prisma)
