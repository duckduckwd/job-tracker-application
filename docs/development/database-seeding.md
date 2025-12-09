# Database Seeding Guide

## Overview

Database seeding populates your database with initial or test data. This is useful for development, testing, and demo environments.

## Running Seeds

```bash
# Run seed script
npm run db:seed

# Reset database and run seeds
npm run db:reset
```

## Seed File Location

Seeds are defined in `prisma/seed.ts` and run automatically after migrations in development.

## Basic Seeding Patterns

### Create Single Record

```typescript
// prisma/seed.ts
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Test User",
    },
  });

  console.log("Created user:", user.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Upsert (Create or Update)

```typescript
// Prevents duplicate errors on multiple runs
const user = await prisma.user.upsert({
  where: { email: "user@example.com" },
  update: {}, // Update if exists
  create: {
    email: "user@example.com",
    name: "Test User",
  },
});
```

### Create Multiple Records

```typescript
await prisma.post.createMany({
  data: [
    { title: "First Post", userId: user.id },
    { title: "Second Post", userId: user.id },
    { title: "Third Post", userId: user.id },
  ],
  skipDuplicates: true, // Skip if already exists
});
```

### Create with Relations

```typescript
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "Test User",
    posts: {
      create: [{ title: "First Post" }, { title: "Second Post" }],
    },
  },
  include: {
    posts: true,
  },
});
```

## Environment-Specific Seeding

### Development Seeds

```typescript
async function main() {
  if (process.env.NODE_ENV !== "development") {
    console.log("Skipping seeds in non-development environment");
    return;
  }

  // Development-only seed data
  await seedDevelopmentData();
}
```

### Test Seeds

```typescript
// tests/seed-test-data.ts
export async function seedTestData() {
  const prisma = new PrismaClient();

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  await prisma.$disconnect();
  return user;
}

// Use in tests
beforeEach(async () => {
  await seedTestData();
});
```

### Production Seeds

```typescript
async function main() {
  // Only seed essential data in production
  if (process.env.NODE_ENV === "production") {
    await seedProductionData();
    return;
  }

  // Full seed data for development
  await seedDevelopmentData();
}

async function seedProductionData() {
  // Essential data only (e.g., admin user, default settings)
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
    },
  });
}
```

## Advanced Patterns

### Seed from JSON File

```typescript
import { readFileSync } from "fs";
import { join } from "path";

async function seedFromFile() {
  const data = JSON.parse(
    readFileSync(join(__dirname, "seed-data.json"), "utf-8"),
  );

  for (const item of data.users) {
    await prisma.user.create({
      data: item,
    });
  }
}
```

### Seed with Faker

```bash
npm install -D @faker-js/faker
```

```typescript
import { faker } from "@faker-js/faker";

async function seedUsers(count: number) {
  const users = Array.from({ length: count }, () => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
  }));

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
}

// Create 50 random users
await seedUsers(50);
```

### Seed with Relationships

```typescript
async function seedJobApplications() {
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Test User",
    },
  });

  const companies = await prisma.company.createMany({
    data: [
      { name: "TechCorp", website: "https://techcorp.com" },
      { name: "StartupXYZ", website: "https://startupxyz.com" },
    ],
    skipDuplicates: true,
  });

  const techCorp = await prisma.company.findFirst({
    where: { name: "TechCorp" },
  });

  if (techCorp) {
    await prisma.jobApplication.create({
      data: {
        position: "Software Engineer",
        status: "APPLIED",
        userId: user.id,
        companyId: techCorp.id,
        appliedDate: new Date(),
      },
    });
  }
}
```

### Conditional Seeding

```typescript
async function main() {
  // Check if data already exists
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Seed data
  await seedUsers();
  await seedPosts();
}
```

### Transaction Seeding

```typescript
async function main() {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: "user@example.com",
        name: "Test User",
      },
    });

    await tx.post.createMany({
      data: [
        { title: "Post 1", userId: user.id },
        { title: "Post 2", userId: user.id },
      ],
    });
  });
}
```

## Organizing Seed Files

### Multiple Seed Functions

```typescript
// prisma/seed.ts
import { seedUsers } from "./seeds/users";
import { seedPosts } from "./seeds/posts";
import { seedComments } from "./seeds/comments";

async function main() {
  console.log("🌱 Seeding database...");

  await seedUsers();
  await seedPosts();
  await seedComments();

  console.log("✅ Seeding completed");
}
```

### Separate Seed Files

```typescript
// prisma/seeds/users.ts
import { PrismaClient } from "../../generated/prisma";

export async function seedUsers(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: [
      { email: "user1@example.com", name: "User 1" },
      { email: "user2@example.com", name: "User 2" },
    ],
    skipDuplicates: true,
  });
}

// prisma/seed.ts
import { PrismaClient } from "../generated/prisma";
import { seedUsers } from "./seeds/users";

const prisma = new PrismaClient();

async function main() {
  await seedUsers(prisma);
}
```

## Clearing Data

### Clear All Data

```typescript
async function clearDatabase() {
  const tables = ["Post", "User"]; // Order matters for foreign keys

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
}

// Or use deleteMany
async function clearDatabase() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
}
```

### Reset and Reseed

```bash
# Reset database and run seeds
npm run db:reset

# Or manually
npx prisma migrate reset
```

## Testing Seeds

### Verify Seed Data

```typescript
async function main() {
  await seedUsers();

  // Verify
  const userCount = await prisma.user.count();
  console.log(`Created ${userCount} users`);

  if (userCount === 0) {
    throw new Error("Seeding failed: no users created");
  }
}
```

### Idempotent Seeds

```typescript
// Seeds that can run multiple times safely
async function main() {
  // Use upsert instead of create
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { name: "Updated Name" },
    create: {
      email: "user@example.com",
      name: "Test User",
    },
  });

  // Use skipDuplicates
  await prisma.post.createMany({
    data: posts,
    skipDuplicates: true,
  });
}
```

## Common Use Cases

### Development Environment

```typescript
async function seedDevelopment() {
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      email: "dev@example.com",
      name: "Dev User",
    },
  });

  // Create sample data for testing UI
  await prisma.post.createMany({
    data: Array.from({ length: 20 }, (_, i) => ({
      title: `Sample Post ${i + 1}`,
      userId: user.id,
    })),
    skipDuplicates: true,
  });
}
```

### Demo Environment

```typescript
async function seedDemo() {
  // Create realistic demo data
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo User",
      posts: {
        create: [
          {
            title: "Welcome to the Demo",
            content: "This is a sample post...",
          },
          {
            title: "Getting Started",
            content: "Here's how to use the app...",
          },
        ],
      },
    },
  });
}
```

### CI/CD Pipeline

```typescript
async function seedCI() {
  // Minimal data for integration tests
  const user = await prisma.user.create({
    data: {
      email: "ci@example.com",
      name: "CI User",
    },
  });

  return user;
}
```

## Best Practices

### 1. Use Upsert for Idempotency

```typescript
// ✅ Good: Can run multiple times
await prisma.user.upsert({
  where: { email: "user@example.com" },
  update: {},
  create: { email: "user@example.com", name: "User" },
});

// ❌ Bad: Fails on second run
await prisma.user.create({
  data: { email: "user@example.com", name: "User" },
});
```

### 2. Handle Foreign Keys

```typescript
// ✅ Good: Create in correct order
const user = await prisma.user.create({ data: userData });
await prisma.post.create({ data: { ...postData, userId: user.id } });

// ❌ Bad: Foreign key constraint error
await prisma.post.create({ data: { ...postData, userId: "nonexistent" } });
```

### 3. Use Transactions for Related Data

```typescript
// ✅ Good: All or nothing
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.post.create({ data: postData }),
]);
```

### 4. Log Progress

```typescript
console.log("🌱 Seeding users...");
await seedUsers();
console.log("✅ Users seeded");

console.log("🌱 Seeding posts...");
await seedPosts();
console.log("✅ Posts seeded");
```

### 5. Handle Errors Gracefully

```typescript
try {
  await seedUsers();
} catch (error) {
  console.error("Failed to seed users:", error);
  // Continue with other seeds or exit
}
```

## Troubleshooting

### Seed Script Not Running

```bash
# Ensure seed script is configured in package.json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}

# Run manually
npx tsx prisma/seed.ts
```

### Foreign Key Errors

```typescript
// Create parent records first
const user = await prisma.user.create({ data: userData });

// Then create child records
await prisma.post.create({
  data: { ...postData, userId: user.id },
});
```

### Duplicate Key Errors

```typescript
// Use upsert or skipDuplicates
await prisma.user.createMany({
  data: users,
  skipDuplicates: true,
});
```

## Resources

- [Prisma Seeding Documentation](https://www.prisma.io/docs/guides/database/seed-database)
- [Faker.js Documentation](https://fakerjs.dev)
- [Database Setup Guide](./database-setup.md)
