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

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(jobs): add filtering by application status

- Add status filter dropdown to job list
- Implement filter logic in useJobApplications hook
- Add tests for filtering functionality
- Update job list component to handle filtered results"

# Push changes
git push origin feature/add-job-filtering
```

#### Commit Message Format

```bash
# Format: type(scope): description
#
# Body (optional): More detailed explanation
# - List of changes
# - Implementation details
# - Breaking changes
#
# Footer (optional): Issue references

# Examples:
feat(auth): add OAuth login with Discord
fix(db): resolve connection timeout issues
docs(api): update health check endpoint documentation
refactor(jobs): extract job service logic
test(auth): add unit tests for authentication flow
chore(deps): update dependencies to latest versions
```

#### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process or auxiliary tools

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

### Commit Message Hook

```bash
#!/bin/sh
# .husky/commit-msg

# Validate commit message format
commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "❌ Invalid commit message format"
  echo "Format: type(scope): description"
  echo "Example: feat(auth): add OAuth login"
  exit 1
fi

echo "✅ Commit message format is valid"
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
