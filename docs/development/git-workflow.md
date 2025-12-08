# Git Workflow Guide

## Overview

This document outlines the Git workflow and branching strategy for the Job Application Tracker project to ensure consistent collaboration and code quality.

## Branching Strategy

### Branch Types

#### Main Branches

- **`main`**: Production-ready code, always deployable
- **`develop`**: Integration branch for features, used for staging deployments

#### Supporting Branches

- **`feature/*`**: New features and enhancements
- **`fix/*`**: Bug fixes
- **`hotfix/*`**: Critical production fixes
- **`release/*`**: Release preparation
- **`docs/*`**: Documentation updates

### Branch Naming Convention

```bash
# Feature branches
feature/add-job-filtering
feature/improve-dashboard-ui
feature/integrate-linkedin-api

# Bug fix branches
fix/authentication-redirect-issue
fix/database-connection-timeout
fix/mobile-responsive-layout

# Hotfix branches (critical production issues)
hotfix/security-vulnerability-patch
hotfix/database-connection-leak

# Release branches
release/v1.2.0
release/v2.0.0-beta

# Documentation branches
docs/update-api-documentation
docs/add-deployment-guide
docs/improve-contributing-guidelines
```

## Workflow Process

### 1. Starting New Work

#### For Features

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-job-filtering

# Push branch to remote
git push -u origin feature/add-job-filtering
```

#### For Bug Fixes

```bash
# Update main branch
git checkout main
git pull origin main

# Create fix branch
git checkout -b fix/authentication-redirect-issue

# Push branch to remote
git push -u origin fix/authentication-redirect-issue
```

#### For Hotfixes

```bash
# Create hotfix from main (production)
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-patch

# Push branch to remote
git push -u origin hotfix/critical-security-patch
```

### 2. Development Process

#### Making Commits

**Method 1: Guided Commits (Recommended)**

```bash
# Stage changes
git add .

# Use interactive commit tool
npm run commit
# This will prompt you for:
# - Type (feat, fix, docs, etc.)
# - Scope (optional)
# - Description
# - Body (optional)
# - Breaking changes (optional)

# Push changes
git push origin feature/add-job-filtering
```

**Method 2: Manual Commits**

```bash
# Stage changes
git add .

# Commit with properly formatted message
git commit -m "feat: add filtering by application status"
# Note: Message will be automatically validated

# Push changes
git push origin feature/add-job-filtering
```

#### Commit Message Format (Enforced)

**Format**: `type[optional scope]: description`

```bash
# ✅ Valid examples (will be accepted):
feat: add OAuth login with Discord
fix: resolve connection timeout issues
docs: update health check endpoint documentation
refactor: extract job service logic
test: add unit tests for authentication flow
chore: update dependencies to latest versions

# ❌ Invalid examples (will be rejected):
"added login"           # No type
"feat add login"        # Missing colon
"FEAT: add login"       # Wrong case
"feature: add login"    # Invalid type
```

**Automatic Validation**: All commit messages are automatically validated by commitlint. Invalid messages will be rejected.

#### Commit Types (Enforced)

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process or auxiliary tools
- **perf**: Performance improvement
- **ci**: Changes to CI configuration files and scripts
- **build**: Changes that affect the build system or external dependencies
- **revert**: Reverts a previous commit

**Note**: Only these types are allowed. Other types will be rejected by commitlint.

### 3. Code Review Process

#### Creating Pull Request

```bash
# Ensure branch is up to date
git checkout feature/add-job-filtering
git pull origin main
git rebase main  # Optional: rebase for cleaner history

# Push final changes
git push origin feature/add-job-filtering

# Create PR through GitHub interface
```

#### Pull Request Template

```markdown
## Description

Brief description of the changes made and why.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Changes Made

- List of specific changes
- New files added
- Modified functionality
- Removed code/features

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All existing tests pass

## Screenshots (if applicable)

Include screenshots for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is properly commented
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests pass locally
```

#### Review Guidelines

```bash
# Reviewer checklist:
- [ ] Code follows project standards
- [ ] Logic is sound and efficient
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Breaking changes documented
```

### 4. Merging Strategy

#### Feature/Fix Branches

```bash
# Use "Squash and merge" for feature branches
# This creates a clean, linear history

# GitHub merge options:
1. "Squash and merge" (recommended for features)
2. "Rebase and merge" (for small, clean commits)
3. "Create a merge commit" (for collaborative features)
```

#### Hotfix Branches

```bash
# Merge hotfix to main
git checkout main
git merge --no-ff hotfix/critical-security-patch
git tag -a v1.1.1 -m "Hotfix: Critical security patch"
git push origin main --tags

# Also merge to develop
git checkout develop
git merge --no-ff hotfix/critical-security-patch
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-security-patch
git push origin --delete hotfix/critical-security-patch
```

## Advanced Git Operations

### Rebasing

```bash
# Interactive rebase to clean up commits
git rebase -i HEAD~3

# Rebase feature branch onto latest main
git checkout feature/add-job-filtering
git rebase main

# Force push after rebase (use with caution)
git push --force-with-lease origin feature/add-job-filtering
```

### Cherry-picking

```bash
# Apply specific commit to another branch
git checkout main
git cherry-pick abc123def456

# Cherry-pick range of commits
git cherry-pick abc123..def456
```

### Stashing

```bash
# Stash current changes
git stash push -m "WIP: job filtering implementation"

# List stashes
git stash list

# Apply stash
git stash pop

# Apply specific stash
git stash apply stash@{1}
```

## Release Management

### Release Branch Workflow

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Finalize release (version bumps, changelog, etc.)
npm version minor  # Updates package.json version

# Commit release changes
git add .
git commit -m "chore(release): prepare v1.2.0 release"

# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0

# Push everything
git push origin main develop --tags

# Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### Semantic Versioning

```bash
# Version format: MAJOR.MINOR.PATCH
# Example: 1.2.3

# MAJOR: Breaking changes
1.0.0 → 2.0.0

# MINOR: New features (backward compatible)
1.0.0 → 1.1.0

# PATCH: Bug fixes (backward compatible)
1.0.0 → 1.0.1

# Pre-release versions
1.2.0-alpha.1
1.2.0-beta.1
1.2.0-rc.1
```

## Git Hooks

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm run test

# Check for secrets
git diff --cached --name-only | xargs grep -l "API_KEY\|SECRET\|PASSWORD" && {
  echo "❌ Potential secrets detected in staged files"
  exit 1
}

echo "✅ Pre-commit checks passed"
```

### Commit Message Hook (Automated)

```bash
#!/usr/bin/env sh
# .husky/commit-msg
. "$(dirname -- "$0")/_/husky.sh"

# Commitlint automatically validates commit messages
npx --no -- commitlint --edit ${1}
```

**What it does**:

- Automatically validates commit messages using commitlint
- Enforces conventional commit format
- Rejects invalid commit messages
- No manual configuration needed

### Pre-push Hook (Automated)

```bash
#!/usr/bin/env sh
# .husky/pre-push
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."

# Run type checking
npm run typecheck || exit 1

# Run linting
npm run lint || exit 1

# Run tests (allow no tests)
npm run test || true

# Note: Build step removed - requires database connection
# CI/CD will handle build validation with proper environment

echo "✅ All pre-push checks passed!"
```

**What it does**:

- Runs comprehensive checks before every push
- Prevents broken code from reaching remote repository
- Catches issues early before CI/CD
- Maintains code quality standards

## Push Guidelines

### Pre-Push Checklist (Automated)

Before every push, the following checks run automatically:

```bash
# Automated pre-push hook runs:
npm run typecheck  # TypeScript validation
npm run lint       # Code quality checks
npm run test       # Unit tests (allows no tests)
# Build validation handled by CI/CD with proper environment
```

### Manual Push Best Practices

```bash
# ✅ Good: Push frequently with small changes
git push origin feature/add-login

# ✅ Good: Push after completing logical units of work
git push origin feature/user-dashboard

# ❌ Avoid: Pushing broken code
# ❌ Avoid: Large commits with multiple unrelated changes
# ❌ Avoid: Pushing without running tests locally
```

### Force Push Guidelines

```bash
# ✅ Safe: Use --force-with-lease (checks for remote changes)
git push --force-with-lease origin feature/my-branch

# ❌ Dangerous: Never use --force on shared branches
git push --force origin main  # DON'T DO THIS

# ✅ Safe: Only force push on your own feature branches
git push --force-with-lease origin feature/my-work
```

### Branch Protection Rules

- **main**: Protected, requires PR and reviews, no direct pushes
- **develop**: Protected, requires PR, no direct pushes
- **feature/\***: Can force push (your own branches only)
- **hotfix/\***: Requires review before merging to main

### Safe Push Commands

```bash
# Safe push with all checks (add to package.json)
npm run push-safe     # Runs pre-push + git push
npm run push-force-safe  # Runs pre-push + git push --force-with-lease
```

## Git Best Practices (Implemented)

### Automated File Handling

- **`.gitattributes`**: Ensures consistent line endings across platforms
- **Enhanced `.gitignore`**: Prevents IDE, OS, and security files from being committed

### Automated Maintenance

```bash
# Clean up merged branches
npm run git:clean

# Prune remote references and garbage collect
npm run git:prune
```

### Enhanced Security Scanning

Pre-commit hook automatically:

- Scans for potential secrets (API_KEY, SECRET, PASSWORD, TOKEN)
- Detects large files (>1MB) before commit
- Runs lint-staged for code quality

### Post-merge Automation

After merging/pulling, automatically:

- Reinstalls dependencies if `package.json` changed
- Regenerates Prisma client if `schema.prisma` changed

### Repository Maintenance

```bash
# Weekly cleanup routine
npm run git:clean && npm run git:prune
```

## Troubleshooting

### Common Issues

#### Merge Conflicts

```bash
# When conflicts occur during merge/rebase
git status  # See conflicted files

# Edit files to resolve conflicts
# Look for conflict markers: <<<<<<<, =======, >>>>>>>

# After resolving conflicts
git add resolved-file.ts
git commit  # For merge
git rebase --continue  # For rebase
```

#### Undoing Changes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo changes to specific file
git checkout HEAD -- file.ts

# Revert a commit (creates new commit)
git revert abc123def456
```

#### Branch Management

```bash
# List all branches
git branch -a

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Rename current branch
git branch -m new-branch-name

# Track remote branch
git branch --set-upstream-to=origin/feature/branch-name
```

### Recovery Scenarios

#### Lost Commits

```bash
# Find lost commits
git reflog

# Recover lost commit
git checkout abc123def456
git checkout -b recovery-branch
```

#### Corrupted Repository

```bash
# Check repository integrity
git fsck

# Clean up repository
git gc --prune=now

# Re-clone if severely corrupted
git clone https://github.com/user/repo.git repo-backup
```

## Best Practices

### Commit Guidelines

- **Atomic commits**: Each commit should represent a single logical change
- **Descriptive messages**: Explain what and why, not just what
- **Test before commit**: Ensure code works and tests pass
- **Review your changes**: Use `git diff --cached` before committing

### Branch Management

- **Keep branches focused**: One feature/fix per branch
- **Regular updates**: Rebase or merge main regularly
- **Clean up**: Delete merged branches promptly
- **Descriptive names**: Use clear, descriptive branch names

### Collaboration

- **Communicate**: Discuss major changes before implementing
- **Review thoroughly**: Take time to review code properly
- **Be respectful**: Provide constructive feedback
- **Learn from reviews**: Use feedback to improve code quality

### Security

- **Never commit secrets**: Use environment variables
- **Review dependencies**: Check for security vulnerabilities
- **Sign commits**: Use GPG signing for important commits
- **Audit history**: Regularly review commit history for issues
