# ADR-004: Development Tooling and Code Quality

## Status

Accepted

## Date

2024-12-08

## Context

Need robust development tooling to maintain code quality, prevent bugs, and ensure consistent development experience.

## Decision

- **Testing**: Jest + React Testing Library
- **Pre-commit hooks**: Husky + lint-staged
- **Linting**: ESLint with TypeScript rules + Next.js config
- **Formatting**: Prettier with Tailwind plugin
- **Type checking**: TypeScript strict mode
- **Environment validation**: T3 env with Zod schemas

## Rationale

- **Jest/RTL**: Standard React testing tools, excellent Next.js support
- **Husky**: Prevents broken code from being committed
- **ESLint**: Catches errors and enforces patterns
- **Prettier**: Eliminates style debates, consistent formatting
- **Strict TypeScript**: Maximum type safety
- **T3 env**: Runtime validation prevents deployment issues

## Implementation

- Pre-commit hooks run linting, formatting, and type checking
- Test environment configured with proper mocks
- ESLint rules optimised for Next.js and TypeScript
- Environment variables validated at startup

## Consequences

**Positive:**

- High code quality maintained automatically
- Consistent code style across team
- Early bug detection
- Confident deployments

**Negative:**

- Slower commit process due to pre-commit hooks
- Initial setup complexity
- Learning curve for team members
