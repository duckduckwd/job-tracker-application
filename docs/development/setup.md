# Development Setup Guide

## Prerequisites

### Required Software

- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Docker**: Latest version (for PostgreSQL database)
- **Git**: Latest version

### Recommended Tools

- **VS Code**: With TypeScript, ESLint, and Prettier extensions
- **Docker Desktop**: For easy container management
- **Postman/Insomnia**: For API testing

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/your-username/job-application-tracker.git
cd job-application-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Generate auth secret
npx auth secret

# Update .env.local with your values (see environment-variables.md)
```

### 4. Database Setup

```bash
# Start PostgreSQL container
docker-compose up -d

# Push database schema
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Verification

### Check Application Health

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy" },
    "environment": { "status": "healthy" }
  }
}
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Development Workflow

### Code Quality Checks

Pre-commit hooks automatically run:

- ESLint (code linting)
- Prettier (code formatting)
- TypeScript (type checking)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run typecheck    # Run TypeScript checks
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## IDE Configuration

### VS Code Extensions

Install these recommended extensions:

- TypeScript and JavaScript Language Features
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Prisma

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Database Connection Issues

```bash
# Check Docker container status
docker ps

# Restart database container
docker-compose restart

# Check database logs
docker-compose logs db
```

### Environment Variable Errors

- Ensure all required variables are set in `.env.local`
- Run `npx auth secret` to generate AUTH_SECRET
- Check `docs/development/environment-variables.md` for details

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### Pre-commit Hook Issues

```bash
# Skip hooks temporarily (not recommended)
git commit --no-verify

# Fix hook permissions
chmod +x .husky/pre-commit

# Reinstall Husky
npm run prepare
```

## Next Steps

1. Read [Environment Variables Guide](./environment-variables.md)
2. Review [Database Setup Guide](./database-setup.md)
3. Check [API Documentation](../api/README.md)
4. Start building features!

## Getting Help

- Check existing [GitHub Issues](https://github.com/your-username/job-application-tracker/issues)
- Review [Troubleshooting Guide](./troubleshooting.md)
- Ask questions in project discussions
