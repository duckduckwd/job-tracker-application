# <img src="public/favicon.ico" width="24" height="24" alt="Onward" /> Onward

A modern job application tracking system built with the [T3 Stack](https://create.t3.gg/), featuring a clean interface for managing your job search process.

## Features

- Track job applications with detailed information
- Organize applications by status and priority
- Modern, responsive UI with dark mode support
- Type-safe forms with Zod validation
- Database management with Prisma

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

## Tech Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## Development

```bash
# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## UI Components

### Quick Setup with shadcn/ui

```bash
# Initialize shadcn/ui
npm run ui:init

# Add components
npm run ui:add button input card
```

For detailed guidance on building custom components, see [UI Components Guide](./docs/development/ui-components.md).

## Error Tracking with Sentry

### Recommended: Sentry Cloud (Free Tier)

- 5,000 errors/month free
- No local setup required
- Production-ready

### Setup

1. Create account at [sentry.io](https://sentry.io)
2. Create new Next.js project
3. Install SDK:

```bash
npx @sentry/wizard@latest -i nextjs
```

### Self-hosted Alternative

Sentry self-hosted requires 16GB+ RAM. For development, the cloud free tier is more practical.

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
