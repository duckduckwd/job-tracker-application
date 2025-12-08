# Project Structure

## Overview

This document outlines the current project structure and organization patterns used in the Job Application Tracker.

## Source Directory (`src/`)

### Components (`~/components/`)

Organized by purpose to prevent bloat and improve maintainability:

```
components/
├── error-boundaries/     # Error handling components
│   ├── ErrorBoundary.tsx
│   └── ApiErrorBoundary.tsx
├── providers/           # Context providers
│   └── AnalyticsProvider.tsx
├── demo/               # Development demo components
│   └── AnalyticsDemo.tsx
├── ui/                 # Reusable UI primitives (future)
├── forms/              # Form components (future)
├── layout/             # Layout components (future)
├── charts/             # Data visualization (future)
└── index.ts            # Centralized exports
```

**Import Pattern:**

```typescript
// All components available through main export
import { ErrorBoundary, AnalyticsProvider } from "~/components";
```

### Types (`~/types/`)

Domain-specific type organization to prevent index file bloat:

```
types/
├── analytics.ts        # Analytics events, window extensions
├── components.ts       # React component props/state
├── monitoring.ts       # Logging, performance metrics
├── security.ts         # Security events
└── index.ts           # Re-exports all types
```

**Import Patterns:**

```typescript
// Domain-specific import
import type { AnalyticsEvent } from "~/types/analytics";

// Centralized import (recommended)
import type { AnalyticsEvent, ErrorBoundaryProps } from "~/types";
```

### Features (`~/features/`)

Feature-based organization following domain-driven design:

```
features/
├── job-applications/   # Core job tracking functionality
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── index.ts
├── dashboard/          # Analytics and overview
├── companies/          # Company management
├── contacts/           # Contact tracking
└── settings/           # User preferences
```

**Guidelines:**

- Each feature is self-contained
- Export public API through `index.ts`
- Keep feature-specific logic within the feature directory
- Share common utilities through `~/utils`, `~/hooks`, etc.

## Future Structure Additions

### As Features Develop

**Types Directory:**

```
types/
├── job-application.ts  # Job application entities
├── company.ts          # Company information
├── contact.ts          # Contact management
├── user.ts            # User profiles
└── api.ts             # API response types
```

**Services Directory:**

```
services/
├── api/               # Internal API calls
├── external/          # Third-party integrations
└── notifications/     # Email, push notifications
```

**Utils Directory:**

```
utils/
├── date.ts           # Date formatting, calculations
├── status.ts         # Status-related utilities
├── export.ts         # Data export functionality
└── search.ts         # Search/filter utilities
```

## Organization Principles

### 1. **Domain-Driven Structure**

- Group by business domain rather than technical concerns
- Features contain all related code (components, hooks, services)
- Shared utilities remain at the root level

### 2. **Prevent File Bloat**

- Split large index files into domain-specific files
- Use re-exports to maintain backward compatibility
- Create new domain files as features grow

### 3. **Clear Import Patterns**

- Centralized exports through index files
- Consistent import paths using `~/` alias
- Domain-specific imports when needed

### 4. **Scalable Architecture**

- Structure supports growth without major refactoring
- Clear separation between shared and feature-specific code
- Consistent patterns across all domains

## Migration Notes

### Recent Changes

- **Components**: Reorganized into purpose-based subdirectories
- **Types**: Split from single index file into domain-specific files
- **Features**: Established structure for future development

### Backward Compatibility

All existing imports continue to work through re-exports in index files.
