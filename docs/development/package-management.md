# Package Management Guide

## Overview

This document outlines package management best practices and tools for maintaining dependencies, analyzing bundles, and ensuring security.

## Bundle Analysis

### Analyzing Bundle Size

```bash
# Analyze current bundle
npm run analyze
```

This will:

- Build the application with bundle analysis enabled
- Open an interactive visualization in your browser
- Show which packages/modules are taking up space
- Help identify optimization opportunities

### Understanding the Analysis

The bundle analyzer shows:

- **Parsed Size**: Actual size of files after minification
- **Stat Size**: Size before any processing
- **Gzipped Size**: Size after compression (closest to real-world)

### Optimization Tips

```bash
# Look for:
- Large dependencies that could be replaced
- Duplicate packages (different versions)
- Unused code that wasn't tree-shaken
- Heavy libraries imported in client-side code
```

## Dependency Management

### Security Auditing

```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Check specific severity levels
npm audit --audit-level=moderate
```

### Package Updates

Dependencies are automatically monitored via Dependabot:

- **Weekly scans** for updates
- **Automatic PRs** for security updates
- **Version compatibility** checks

### Manual Updates

```bash
# Check outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (use with caution)
npm update
```

## Development Scripts

### Package-Related Commands

```bash
# Bundle analysis
npm run analyze              # Analyze bundle size

# Dependency management
npm audit                    # Security audit
npm outdated                 # Check outdated packages

# Git maintenance
npm run git:clean           # Remove merged branches
npm run git:prune           # Clean up remote references
```

## Best Practices

### Adding New Dependencies

```bash
# Always check bundle impact
npm run analyze

# Prefer smaller alternatives
# Example: date-fns over moment.js
# Example: lodash/specific-function over entire lodash
```

### Dependency Categories

#### Production Dependencies

```bash
# Core functionality - always needed
npm install package-name
```

#### Development Dependencies

```bash
# Build tools, testing, linting - not in production bundle
npm install --save-dev package-name
```

### Security Guidelines

- **Review dependencies** before adding
- **Keep packages updated** (automated via Dependabot)
- **Audit regularly** for vulnerabilities
- **Use exact versions** for critical packages

### Performance Guidelines

- **Analyze bundle impact** before adding large packages
- **Use tree-shaking friendly** packages when possible
- **Import specific functions** instead of entire libraries
- **Consider code splitting** for large features

## Automated Processes

### Dependabot Configuration

Located in `.github/dependabot.yml`:

- **Weekly updates** for npm packages
- **Security updates** get higher priority
- **Maximum 5 open PRs** to avoid overwhelming

### Bundle Analysis Integration

Integrated in `next.config.js`:

- **On-demand analysis** via `ANALYZE=true`
- **No performance impact** in normal builds
- **Compatible** with Sentry and other tools

## Troubleshooting

### Common Issues

#### Bundle Analysis Not Working

```bash
# Ensure @next/bundle-analyzer is installed
npm install --save-dev @next/bundle-analyzer

# Check environment variable
ANALYZE=true npm run build
```

#### Audit Failures

```bash
# Check specific vulnerabilities
npm audit --json

# Force fix (use with caution)
npm audit fix --force

# Update package-lock.json
rm package-lock.json node_modules -rf
npm install
```

#### Dependency Conflicts

```bash
# Check for duplicate packages
npm ls --depth=0

# Resolve peer dependency warnings
npm install missing-peer-dep

# Use npm overrides in package.json if needed
```

### Performance Issues

#### Large Bundle Size

1. Run `npm run analyze`
2. Identify largest packages
3. Consider alternatives or code splitting
4. Use dynamic imports for heavy features

#### Slow Installs

```bash
# Clear npm cache
npm cache clean --force

# Use npm ci in CI/CD (faster, more reliable)
npm ci
```

## Monitoring and Maintenance

### Regular Tasks

#### Weekly

- Review Dependabot PRs
- Check for security advisories
- Monitor bundle size trends

#### Monthly

- Run full dependency audit
- Review and update dev dependencies
- Clean up unused packages

#### Quarterly

- Major version updates review
- Bundle analysis and optimization
- Dependency strategy review

### Metrics to Track

- **Bundle size trends** (via analyze command)
- **Dependency count** (production vs dev)
- **Security vulnerabilities** (via npm audit)
- **Update frequency** (via Dependabot activity)

## Integration with Development Workflow

### Pre-commit Hooks

- **Lint-staged** ensures code quality
- **No package.json validation** (handled by npm)

### Pre-push Hooks

- **Type checking** validates imports
- **Linting** catches unused imports
- **No bundle analysis** (too slow for frequent pushes)

### CI/CD Integration

- **Dependency caching** for faster builds
- **Security scanning** in pipeline
- **Bundle size monitoring** in production builds
