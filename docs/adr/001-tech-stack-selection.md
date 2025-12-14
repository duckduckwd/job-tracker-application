# ADR-001: Tech Stack Selection

## Status

Accepted

## Date

2024-12-08

## Context

Building a personal job application tracker that may expand to multi-user in the future. Need modern, maintainable stack with good developer experience.

## Decision

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (free tier)
- **Testing**: Jest + React Testing Library + Husky pre-commit hooks
- **Code Quality**: ESLint + Prettier + TypeScript strict mode
- **Error Tracking**: Sentry (free tier)
- **Environment Management**: T3 env validation with Zod

## Rationale

- Next.js 15: Latest features with React 19, excellent DX, serverless-ready
- TypeScript: Prevents runtime errors, better IDE support
- PostgreSQL: Mature, scalable, good free hosting options
- Prisma: Type-safe database access, excellent migrations
- NextAuth: Battle-tested, supports multiple providers
- Jest/RTL: Industry standard React testing, good Next.js integration
- Husky: Prevents bad commits, enforces code quality
- ESLint/Prettier: Consistent code style, catches errors early
- Sentry: Professional error tracking, free tier sufficient
- T3 env: Runtime environment validation, prevents config errors

## Consequences

**Positive:**

- Type safety across full stack
- Modern development patterns
- Easy deployment and scaling
- Strong ecosystem support

**Negative:**

- Learning curve for new concepts
- More complex than simple PHP/MySQL setup
- Potential over-engineering for simple use case

## Alternatives Considered

- **LAMP stack**: Too dated, poor TypeScript support
- **MEAN stack**: MongoDB not ideal for relational data
- **Django**: Python, but team prefers JavaScript ecosystem
