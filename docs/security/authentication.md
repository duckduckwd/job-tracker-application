# Authentication Security

## Overview

Authentication is implemented using NextAuth.js with enterprise-grade security configurations for session management, CSRF protection, and secure cookie handling.

## Authentication Architecture

### Components

- **NextAuth.js**: Authentication framework
- **Database Sessions**: Persistent session storage
- **OAuth Providers**: Discord (extensible to others)
- **Prisma Adapter**: Database integration
- **Security Middleware**: Request protection

### Session Flow

```text
1. User initiates sign-in
2. Redirect to OAuth provider (Discord)
3. Provider callback with authorisation code
4. NextAuth exchanges code for tokens
5. User profile retrieved and stored
6. Database session created
7. Secure session cookie set
8. User redirected to application
```

## Security Configuration

### Session Management

```typescript
session: {
  strategy: "database",        // Database-stored sessions
  maxAge: 30 * 24 * 60 * 60,  // 30 days
  updateAge: 24 * 60 * 60,    // Update every 24 hours
}
```

**Benefits**:

- **Revocable**: Sessions can be invalidated server-side
- **Secure**: No sensitive data in client cookies
- **Auditable**: Session activity tracked in database

### Cookie Security

```typescript
cookies: {
  sessionToken: {
    name: `${env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
    options: {
      httpOnly: true,      // Prevents XSS access
      sameSite: "lax",     // CSRF protection
      path: "/",           // Available site-wide
      secure: env.NODE_ENV === "production", // HTTPS only in production
    },
  },
  // Similar configuration for callbackUrl and csrfToken
}
```

**Security Features**:

- **HttpOnly**: Prevents JavaScript access to cookies
- **Secure**: HTTPS-only transmission in production
- **SameSite**: Protection against CSRF attacks
- **\_\_Secure- prefix**: Additional browser security in production

### CSRF Protection

```typescript
csrfToken: {
  name: `${env.NODE_ENV === "production" ? "__Host-" : ""}next-auth.csrf-token`,
  options: {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: env.NODE_ENV === "production",
  },
}
```

**CSRF Token Features**:

- **Automatic generation**: New token per session
- **Validation**: All state-changing requests validated
- **\_\_Host- prefix**: Strongest browser protection in production

## OAuth Provider Configuration

### Discord Setup

```typescript
providers: [
  DiscordProvider({
    clientId: env.AUTH_DISCORD_ID,
    clientSecret: env.AUTH_DISCORD_SECRET,
  }),
];
```

### Security Considerations

- **Client credentials**: Stored as environment variables
- **Redirect URI validation**: Strict URL matching
- **Scope limitation**: Minimal required permissions
- **Token handling**: Secure storage and refresh

### Adding Additional Providers

```typescript
providers: [
  DiscordProvider({
    /* config */
  }),
  GoogleProvider({
    clientId: env.AUTH_GOOGLE_ID,
    clientSecret: env.AUTH_GOOGLE_SECRET,
  }),
  GitHubProvider({
    clientId: env.AUTH_GITHUB_ID,
    clientSecret: env.AUTH_GITHUB_SECRET,
  }),
];
```

## Database Schema

### User Table

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}
```

### Session Table

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Account Table

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

## Session Security

### Session Lifecycle

1. **Creation**: New session on successful authentication
2. **Validation**: Session checked on each request
3. **Refresh**: Session updated periodically (24 hours)
4. **Expiration**: Automatic cleanup after 30 days
5. **Revocation**: Manual invalidation when needed

### Session Validation

```typescript
// Automatic validation in NextAuth.js
const session = await getServerSession(authConfig);

if (!session?.user) {
  // User not authenticated
  return redirect("/api/auth/signin");
}

// User authenticated, proceed with request
```

### Session Cleanup

```sql
-- Automatic cleanup of expired sessions
DELETE FROM sessions WHERE expires < NOW();
```

## Authentication Middleware

### Route Protection

```typescript
// Protect API routes
export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });

  if (!session && request.nextUrl.pathname.startsWith("/api/protected")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
}
```

### Client-Side Protection

```typescript
// Protect pages with useSession
import { useSession } from 'next-auth/react'

export default function ProtectedPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Loading />
  if (!session) return <SignIn />

  return <Dashboard user={session.user} />
}
```

## Security Best Practices

### Environment Variables

```bash
# Strong secrets required
AUTH_SECRET="32-character-minimum-production-secret"

# Real OAuth credentials (not placeholders)
AUTH_DISCORD_ID="real-discord-client-id"
AUTH_DISCORD_SECRET="real-discord-client-secret"
```

### Production Checklist

- [ ] AUTH_SECRET is 32+ characters
- [ ] OAuth credentials are production values
- [ ] HTTPS enforced for all authentication flows
- [ ] Session cookies use \_\_Secure- prefix
- [ ] CSRF tokens use \_\_Host- prefix
- [ ] Database sessions properly indexed

## Monitoring and Logging

### Authentication Events

```typescript
// Log successful authentications
Logger.info("User authenticated", {
  userId: session.user.id,
  provider: account.provider,
  ip: request.ip,
});

// Log failed authentication attempts
SecurityLogger.logAuthFailure(ip, userAgent, {
  provider: "discord",
  error: "invalid_credentials",
});
```

### Security Metrics

- **Authentication success rate**
- **Failed login attempts per IP**
- **Session duration statistics**
- **Provider usage distribution**

### Alerts

- **Multiple failed logins**: Same IP, short timeframe
- **Unusual login patterns**: New device, location, time
- **Session anomalies**: Concurrent sessions, rapid creation

## Attack Prevention

### Brute Force Protection

- **Rate limiting**: 100 requests per 15 minutes
- **Account lockout**: After repeated failures
- **Progressive delays**: Increasing wait times

### Session Hijacking Prevention

- **Secure cookies**: HTTPS-only transmission
- **HttpOnly cookies**: No JavaScript access
- **Session rotation**: New session ID on privilege change

### CSRF Attack Prevention

- **SameSite cookies**: Automatic CSRF protection
- **CSRF tokens**: Explicit validation for state changes
- **Origin validation**: Check request origin headers

## Testing Authentication

### Manual Testing

```bash
# Test authentication flow
curl -c cookies.txt http://localhost:3000/api/auth/signin
curl -b cookies.txt http://localhost:3000/api/auth/session
```

### Automated Testing

```javascript
// Jest test for authentication
test("should require authentication for protected route", async () => {
  const response = await fetch("/api/protected");
  expect(response.status).toBe(401);
});

test("should allow access with valid session", async () => {
  const session = await signIn("credentials", {
    /* test user */
  });
  const response = await fetch("/api/protected", {
    headers: { Cookie: session.cookie },
  });
  expect(response.status).toBe(200);
});
```

## Troubleshooting

### Common Issues

#### **Session not persisting**

- Check cookie settings (secure, sameSite)
- Verify database connection
- Confirm session table exists

#### **CSRF token mismatch**

- Check cookie configuration
- Verify HTTPS in production
- Confirm \_\_Host- prefix usage

#### **OAuth callback errors**

- Verify redirect URI configuration
- Check provider credentials
- Confirm environment variables

### Debug Mode

```typescript
// Enable debug logging
export const authConfig = {
  debug: process.env.NODE_ENV === "development",
  // ... other config
};
```

## Future Enhancements

### Multi-Factor Authentication

- **TOTP**: Time-based one-time passwords
- **SMS**: Text message verification
- **Hardware keys**: WebAuthn support

### Advanced Security

- **Device fingerprinting**: Track known devices
- **Geolocation**: Alert on unusual locations
- **Risk scoring**: Adaptive authentication based on risk

### Audit Features

- **Login history**: Track all authentication events
- **Session management**: User can view/revoke sessions
- **Security notifications**: Email alerts for new logins
