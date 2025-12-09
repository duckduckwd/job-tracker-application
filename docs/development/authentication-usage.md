# Authentication Usage Guide

## Overview

Quick reference for using NextAuth.js authentication in your application. For security details, see [Authentication Security](../security/authentication.md).

## Getting the Session

### Server Components

```typescript
// app/dashboard/page.tsx
import { auth } from "~/server/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
    </div>
  )
}
```

### Client Components

```typescript
"use client"

import { useSession } from "next-auth/react"

export function UserProfile() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Not signed in</div>
  }

  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <img src={session.user.image} alt={session.user.name} />
    </div>
  )
}
```

### API Routes

```typescript
// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use session.user.id for database queries
  const profile = await db.user.findUnique({
    where: { id: session.user.id },
  });

  return NextResponse.json(profile);
}
```

### Server Actions

```typescript
"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function createPost(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const post = await db.post.create({
    data: {
      title: formData.get("title") as string,
      userId: session.user.id,
    },
  });

  return post;
}
```

## Sign In / Sign Out

### Sign In Button

```typescript
"use client"

import { signIn } from "next-auth/react"

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("discord")}
      className="rounded bg-blue-600 px-4 py-2 text-white"
    >
      Sign in with Discord
    </button>
  )
}
```

### Sign In with Redirect

```typescript
"use client"

import { signIn } from "next-auth/react"

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
      className="rounded bg-blue-600 px-4 py-2 text-white"
    >
      Sign in
    </button>
  )
}
```

### Sign Out Button

```typescript
"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded border px-4 py-2"
    >
      Sign out
    </button>
  )
}
```

### Sign Out with Redirect

```typescript
"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded border px-4 py-2"
    >
      Sign out
    </button>
  )
}
```

## Protecting Routes

### Protect Entire Page

```typescript
// app/dashboard/page.tsx
import { auth } from "~/server/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
  }

  return <Dashboard user={session.user} />
}
```

### Protect with Loading State

```typescript
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return <div>Protected content</div>
}
```

### Protect API Route

```typescript
// app/api/protected/route.ts
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: "Protected data" });
}
```

### Middleware Protection

```typescript
// middleware.ts
import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;

  if (!isAuthenticated && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

## Session Provider Setup

### Root Layout

```typescript
// app/layout.tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

## Common Patterns

### Conditional Rendering

```typescript
"use client"

import { useSession } from "next-auth/react"
import { SignInButton } from "./SignInButton"
import { UserMenu } from "./UserMenu"

export function Header() {
  const { data: session } = useSession()

  return (
    <header>
      <nav>
        {session ? (
          <UserMenu user={session.user} />
        ) : (
          <SignInButton />
        )}
      </nav>
    </header>
  )
}
```

### User-Specific Data

```typescript
// app/my-posts/page.tsx
import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { redirect } from "next/navigation"

export default async function MyPostsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  const posts = await db.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1>My Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}
```

### Role-Based Access

```typescript
// Extend session type first (in src/server/auth/config.ts)
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "user" | "admin"
    } & DefaultSession["user"]
  }
}

// Then use in components
export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  if (session.user.role !== "admin") {
    redirect("/unauthorized")
  }

  return <AdminDashboard />
}
```

### Optimistic UI Updates

```typescript
"use client"

import { useSession } from "next-auth/react"
import { useOptimistic } from "react"

export function ProfileForm() {
  const { data: session, update } = useSession()
  const [optimisticName, setOptimisticName] = useOptimistic(session?.user.name)

  const handleSubmit = async (formData: FormData) => {
    const newName = formData.get("name") as string

    // Optimistically update UI
    setOptimisticName(newName)

    // Update on server
    await fetch("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    })

    // Refresh session
    await update()
  }

  return (
    <form action={handleSubmit}>
      <input name="name" defaultValue={optimisticName} />
      <button type="submit">Update</button>
    </form>
  )
}
```

## Testing with Authentication

### Mock Session (Jest)

```typescript
import { auth } from "~/server/auth";

jest.mock("~/server/auth");

describe("Protected Page", () => {
  test("redirects when not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  test("returns data when authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "123", email: "test@example.com" },
    });

    const response = await GET();
    expect(response.status).toBe(200);
  });
});
```

### E2E Testing (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects to sign in when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/api\/auth\/signin/);
  });

  test("allows access when authenticated", async ({ page, context }) => {
    // Set session cookie
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "valid-session-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
  });
});
```

## Troubleshooting

### Session Not Available

```typescript
// ❌ Wrong: Using useSession without SessionProvider
export default function Page() {
  const { data: session } = useSession() // Will not work
}

// ✅ Correct: Wrap app with SessionProvider
// In app/layout.tsx
<SessionProvider>{children}</SessionProvider>
```

### Session Not Updating

```typescript
// Force session refresh
import { useSession } from "next-auth/react";

const { data: session, update } = useSession();

// After updating user data
await fetch("/api/profile", { method: "PATCH", body: data });
await update(); // Refresh session
```

### Type Errors

```typescript
// Ensure session type is properly extended
// In src/server/auth/config.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add custom properties
    } & DefaultSession["user"];
  }
}
```

## Quick Reference

### Authentication Check

| Context          | Method                                   |
| ---------------- | ---------------------------------------- |
| Server Component | `const session = await auth()`           |
| Client Component | `const { data: session } = useSession()` |
| API Route        | `const session = await auth()`           |
| Server Action    | `const session = await auth()`           |
| Middleware       | `const session = req.auth`               |

### Common Operations

| Operation       | Code                                         |
| --------------- | -------------------------------------------- |
| Sign in         | `signIn("discord")`                          |
| Sign out        | `signOut()`                                  |
| Get user ID     | `session.user.id`                            |
| Check auth      | `if (!session) redirect("/api/auth/signin")` |
| Refresh session | `await update()`                             |

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Authentication Security Guide](../security/authentication.md)
- [Session Configuration](https://next-auth.js.org/configuration/options#session)
- [Callbacks Reference](https://next-auth.js.org/configuration/callbacks)
