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

### Run Tests & Quality Checks

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run performance audit
npm run perf:audit

# Check bundle sizes
npm run bundle:check

# Check for unused code
npm run unused:check

# Check for dead code (unused files)
npm run deadcode:check

# Check for unused dependencies
npm run deadcode:dependencies

# Run comprehensive linting (45+ rules across 6 plugins)
npm run lint

# Fix auto-fixable issues (import sorting, formatting, etc.)
npm run lint:fix

# Run all quality checks at once
npm run quality:check

# Fix linting issues automatically
npm run lint:fix

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
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run perf:audit           # Run Lighthouse performance audit
npm run unused:check         # Check for unused code
npm run deadcode:check       # Find unused files
npm run deadcode:dependencies # Find unused dependencies
npm run quality:check        # Run all quality checks
npm run bundle:check         # Check bundle sizes
npm run analyze              # Analyze bundle composition
npm run typecheck            # Run TypeScript checks
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
```

## Testing & Code Quality

### Unit Tests (Jest)

- Located in `__tests__/` directories or `.test.ts` files
- Coverage reports generated in `coverage/` directory
- Minimum 80% coverage threshold enforced

### E2E Tests (Playwright)

- Located in `e2e/` directory
- Tests run against local development server
- Supports multiple browsers (Chrome, Firefox, Safari)

```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Run E2E tests
npm run test:e2e
```

### Performance Testing (Lighthouse)

- Automated performance audits on pull requests
- Measures Core Web Vitals and accessibility
- Performance budgets enforced (80% performance, 90% accessibility)

```bash
# Run performance audit locally
npm run perf:audit
```

### Performance Budgets

- Webpack bundle size limits enforced during build
- Automatic warnings when bundles exceed thresholds
- Bundle composition analysis with @next/bundle-analyzer

**Bundle Size Limits:**

- Main app bundle: 400KB
- Page bundles: 250KB
- Chunk bundles: 200KB

```bash
# Check bundle sizes against limits
npm run bundle:check

# Analyze bundle composition
npm run analyze
```

### Error Boundaries

- React Error Boundaries for graceful error handling
- Automatic error reporting to Sentry
- Custom fallback UI for different error types
- Recovery mechanisms with "Try again" functionality

**Available Components:**

- `ErrorBoundary` - General purpose error boundary
- `ApiErrorBoundary` - Specialized for API errors

```typescript
// Basic usage
import { ErrorBoundary } from '@/components';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Code Quality Tools

#### Import Sorting

- Automatically sorts imports (Node modules → Internal → Relative)
- Enforced by ESLint, fixed with `npm run lint:fix`

#### Unused Code Detection

- ESLint detects unused variables and exports in real-time
- ts-prune provides deeper analysis of unused code

```bash
# Check for unused exports
npm run unused:check

# Get JSON output for CI integration
npm run unused:check:json
```

#### Comprehensive Code Quality Analysis

**Built-in ESLint Rules:**

- Cyclomatic complexity (>10), nesting depth (4 levels), function length (60 lines), parameters (4 max)
- Modern JavaScript: prefer-const, no-var, object-shorthand, prefer-template
- Performance: no-await-in-loop, require-atomic-updates
- Development: no-console (warn/error allowed), no-debugger, no-alert

**TypeScript-ESLint Rules:**

- Type safety: prefer-nullish-coalescing, prefer-optional-chain, switch-exhaustiveness-check
- Code quality: no-explicit-any, no-non-null-assertion, prefer-as-const
- Import management: consistent-type-imports with inline style

**Import Management (simple-import-sort + import):**

- Automatic import sorting (Node modules → Internal → Relative)
- Duplicate import detection, newline enforcement
- Anonymous default export warnings

**SonarJS Rules:**

- Cognitive complexity (>15), duplicate strings (3+ threshold)
- Identical function detection, redundant boolean elimination
- Immediate return preferences

**Unicorn Rules:**

- Modern JavaScript practices: better regex patterns, consistent destructuring
- Array method preferences: prefer includes, startsWith/endsWith
- Loop modernization: no-for-loop, no-array-for-each

**Security Rules:**

- Vulnerability detection: unsafe regex, object injection, eval usage
- Timing attack prevention, pseudo-random byte detection
- Buffer safety, child process warnings, CSRF protection

**React/Next.js Rules:**

- jsx-no-target-blank for security, no-danger warnings
- react-hooks/exhaustive-deps for proper hook dependencies

#### Dead Code Elimination

- Detects unused files and dependencies across the project

```bash
# Find unused files
npm run deadcode:check

# Find unused dependencies
npm run deadcode:dependencies
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
3. Learn [Package Management](./package-management.md) best practices
4. Check [Git Workflow Guide](./git-workflow.md) for collaboration
5. Review [API Documentation](../api/README.md)
6. Start building features!

## Getting Help

- Check existing [GitHub Issues](https://github.com/your-username/job-application-tracker/issues)
- Review [Troubleshooting Guide](./troubleshooting.md)
- Ask questions in project discussions
