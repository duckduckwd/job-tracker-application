# API Development Guide

## Overview

This guide covers creating type-safe, validated API routes using Next.js App Router, Zod validation, and Prisma.

## Project Structure

```text
src/
├── app/api/              # API routes
│   ├── health/
│   │   └── route.ts
│   └── [resource]/
│       └── route.ts
├── schemas/              # Zod validation schemas
│   ├── common.schema.ts
│   └── [resource].schema.ts
└── server/
    └── db.ts            # Prisma client
```

## Creating an API Route

### 1. Define Validation Schema

Create a schema file in `src/schemas/`:

```typescript
// src/schemas/todo.schema.ts
import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
```

Export from `src/schemas/index.ts`:

```typescript
export * from "./todo.schema";
```

### 2. Create API Route

Create route file in `src/app/api/[resource]/route.ts`:

```typescript
// src/app/api/todos/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createTodoSchema } from "~/schemas";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  try {
    const todos = await db.todo.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTodoSchema.parse(body);

    // Create in database
    const todo = await db.todo.create({
      data: validatedData,
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 },
    );
  }
}
```

### 3. Dynamic Routes (with ID)

```typescript
// src/app/api/todos/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { idSchema, updateTodoSchema } from "~/schemas";
import { db } from "~/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Validate ID
    const { id } = idSchema.parse({ id: params.id });

    const todo = await db.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to fetch todo" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = idSchema.parse({ id: params.id });
    const body = await request.json();
    const validatedData = updateTodoSchema.parse(body);

    const todo = await db.todo.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(todo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = idSchema.parse({ id: params.id });

    await db.todo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 },
    );
  }
}
```

## Common Patterns

### Pagination

```typescript
import { paginationSchema } from "~/schemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = paginationSchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  const skip = (page - 1) * limit;

  const [todos, total] = await Promise.all([
    db.todo.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.todo.count(),
  ]);

  return NextResponse.json({
    data: todos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### Search and Filtering

```typescript
import { searchSchema } from "~/schemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { query, sortBy, sortOrder } = searchSchema.parse({
    query: searchParams.get("query"),
    sortBy: searchParams.get("sortBy"),
    sortOrder: searchParams.get("sortOrder"),
  });

  const todos = await db.todo.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
  });

  return NextResponse.json(todos);
}
```

### Authentication

```typescript
import { auth } from "~/server/auth";

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use authenticated user ID
  const todo = await db.todo.create({
    data: {
      ...validatedData,
      userId: session.user.id,
    },
  });

  return NextResponse.json(todo, { status: 201 });
}
```

## Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
}
```

### Error Handling Utility

```typescript
// src/utils/api-error.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "~/generated/prisma";

export function handleApiError(error: unknown) {
  // Validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.errors,
      },
      { status: 400 },
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }
  }

  // Generic server error
  console.error("API Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

Usage:

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... your logic
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Testing API Routes

### Unit Tests

```typescript
// __tests__/api/todos.test.ts
import { POST } from "~/app/api/todos/route";
import { db } from "~/server/db";

jest.mock("~/server/db");

describe("POST /api/todos", () => {
  test("creates todo with valid data", async () => {
    const mockTodo = { id: "1", title: "Test", completed: false };
    (db.todo.create as jest.Mock).mockResolvedValue(mockTodo);

    const request = new Request("http://localhost/api/todos", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(mockTodo);
  });

  test("returns 400 for invalid data", async () => {
    const request = new Request("http://localhost/api/todos", {
      method: "POST",
      body: JSON.stringify({ title: "" }), // Invalid: empty title
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });
});
```

### Integration Tests (E2E)

```typescript
// e2e/api/todos.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Todos API", () => {
  test("creates and retrieves todo", async ({ request }) => {
    // Create todo
    const createResponse = await request.post("/api/todos", {
      data: { title: "Test Todo" },
    });
    expect(createResponse.status()).toBe(201);
    const todo = await createResponse.json();

    // Retrieve todo
    const getResponse = await request.get(`/api/todos/${todo.id}`);
    expect(getResponse.status()).toBe(200);
    const retrieved = await getResponse.json();
    expect(retrieved.title).toBe("Test Todo");
  });
});
```

## Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good: Validate with Zod
const validatedData = schema.parse(body);

// ❌ Bad: Trust input
const data = await request.json();
```

### 2. Use Proper HTTP Status Codes

- `200` - Success (GET, PATCH, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### 3. Return Consistent Error Format

```typescript
// Always use same structure
return NextResponse.json(
  { error: "Error message", details: optionalDetails },
  { status: 400 },
);
```

### 4. Log Errors

```typescript
import { Logger } from "~/lib/monitoring/logger"

catch (error) {
  Logger.error("Failed to create todo", { error, userId })
  return NextResponse.json({ error: "Failed to create todo" }, { status: 500 })
}
```

### 5. Use TypeScript Types

```typescript
// Export types from schemas
export type CreateTodoInput = z.infer<typeof createTodoSchema>;

// Use in functions
async function createTodo(data: CreateTodoInput) {
  // Type-safe
}
```

## Common Validation Schemas

The template includes common schemas in `src/schemas/common.schema.ts`:

- `paginationSchema` - Page and limit validation
- `idSchema` - CUID validation
- `searchSchema` - Search query and sorting
- `dateRangeSchema` - Date range filtering

Import and use:

```typescript
import { paginationSchema, idSchema } from "~/schemas";
```

## Resources

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Documentation](https://zod.dev)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
