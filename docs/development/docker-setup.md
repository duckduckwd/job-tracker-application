# Docker Setup Guide

## Overview

This project includes Docker configurations for both development and production environments.

## Quick Start

### Development (Database Only)

```bash
# Start PostgreSQL database
docker-compose up -d

# Run Next.js app locally
npm run dev
```

### Production (Full Stack)

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build
```

## Development Setup

### Basic Services

The default `docker-compose.yml` includes:

- **PostgreSQL 15** - Database server
- **Optional services** - Redis, Mailhog, pgAdmin (via profiles)

### Starting Services

```bash
# Start database only (default)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

### Optional Services

Use Docker Compose profiles to enable optional services:

#### Redis Cache

```bash
# Start database + Redis
docker-compose --profile cache up -d

# Connection string
REDIS_URL=redis://localhost:6379
```

#### Mailhog (Email Testing)

```bash
# Start database + Mailhog
docker-compose --profile mail up -d

# SMTP: localhost:1025
# Web UI: http://localhost:8025
```

#### pgAdmin (Database GUI)

```bash
# Start database + pgAdmin
docker-compose --profile admin up -d

# Web UI: http://localhost:5050
# Email: admin@example.com
# Password: admin
```

#### All Services

```bash
# Start everything
docker-compose --profile cache --profile mail --profile admin up -d
```

## Connection Strings

### PostgreSQL

```bash
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobtracker"
```

### Redis (if enabled)

```bash
# .env.local
REDIS_URL="redis://localhost:6379"
```

### Mailhog (if enabled)

```bash
# .env.local
SMTP_HOST="localhost"
SMTP_PORT="1025"
```

## Database Management

### Using Prisma

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Using pgAdmin

1. Start pgAdmin: `docker-compose --profile admin up -d`
2. Open http://localhost:5050
3. Login with `admin@example.com` / `admin`
4. Add server:
   - Host: `db` (or `host.docker.internal` on Mac/Windows)
   - Port: `5432`
   - Username: `postgres`
   - Password: `password`

### Direct Database Access

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d jobtracker

# Run SQL commands
\dt                    # List tables
\d users              # Describe table
SELECT * FROM users;  # Query data
\q                    # Quit
```

## Production Setup

### Building for Production

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Environment Variables

Create `.env.production`:

```bash
DATABASE_URL="postgresql://postgres:secure-password@db:5432/jobtracker"
AUTH_SECRET="your-32-character-production-secret"
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
NODE_ENV="production"
```

Use in production:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Services show "healthy" when ready
```

### Database Health

```bash
# Wait for database to be ready
docker-compose exec db pg_isready -U postgres
```

### Application Health

```bash
# Check app health endpoint
curl http://localhost:3000/api/health
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5432
lsof -i :5432

# Kill process or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use different host port
```

### Database Connection Failed

```bash
# Check database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Container Won't Start

```bash
# View detailed logs
docker-compose logs -f

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Reset Everything

```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## Performance Tips

### Development

```bash
# Use volumes for faster rebuilds (already configured)
# Run app locally, only database in Docker
docker-compose up -d db
npm run dev
```

### Production

```bash
# Use multi-stage builds (already configured in Dockerfile)
# Optimize image size with alpine base
# Use health checks for zero-downtime deploys
```

## Alternative: Standalone Database Script

If you prefer not to use Docker Compose:

```bash
# Use the standalone script
./start-database.sh

# This creates a single PostgreSQL container
# Useful for simple local development
```

## Docker Commands Reference

### Compose Commands

```bash
docker-compose up -d              # Start services in background
docker-compose down               # Stop services
docker-compose ps                 # List services
docker-compose logs -f [service]  # View logs
docker-compose restart [service]  # Restart service
docker-compose exec [service] sh  # Shell into container
```

### Container Commands

```bash
docker ps                         # List running containers
docker ps -a                      # List all containers
docker logs [container]           # View container logs
docker exec -it [container] sh    # Shell into container
docker stop [container]           # Stop container
docker rm [container]             # Remove container
```

### Volume Commands

```bash
docker volume ls                  # List volumes
docker volume inspect [volume]    # Inspect volume
docker volume rm [volume]         # Remove volume
docker volume prune               # Remove unused volumes
```

### Image Commands

```bash
docker images                     # List images
docker rmi [image]                # Remove image
docker image prune                # Remove unused images
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Local Testing

```bash
# Start test database
docker-compose up -d db

# Run tests
npm test

# Cleanup
docker-compose down
```

## Best Practices

### Development

- ✅ Use Docker for database only
- ✅ Run Next.js app locally for hot reload
- ✅ Use profiles for optional services
- ✅ Keep volumes for data persistence

### Production

- ✅ Use multi-stage builds
- ✅ Set proper environment variables
- ✅ Enable health checks
- ✅ Use restart policies
- ✅ Monitor container logs

### Security

- ✅ Change default passwords
- ✅ Use secrets for sensitive data
- ✅ Don't commit `.env` files
- ✅ Use least privilege principles
- ✅ Keep images updated

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
