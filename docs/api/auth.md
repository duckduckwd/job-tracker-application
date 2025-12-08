# Authentication API

## Overview

Authentication is handled by NextAuth.js with the following endpoints.

## Base Path

All authentication endpoints are under `/api/auth/`

## Endpoints

### Sign In

`GET /api/auth/signin`

- Displays sign-in page
- Supports Discord OAuth provider

### Sign Out

`GET /api/auth/signout`

- Signs out current user
- Clears session cookies

### Session

`GET /api/auth/session`

- Returns current user session
- Used by client to check authentication status

### Callback

`GET /api/auth/callback/[provider]`

- OAuth callback endpoint
- Handles provider responses (Discord, etc.)

## Session Response

### Authenticated User

```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://avatar.url"
  },
  "expires": "2024-02-XX T10:00:00.000Z"
}
```

### Unauthenticated

```json
null
```

## Usage Examples

### Check Authentication Status

```javascript
// Client-side
const session = await fetch("/api/auth/session").then((r) => r.json());
if (session?.user) {
  console.log("User is authenticated:", session.user);
} else {
  console.log("User is not authenticated");
}
```

### Programmatic Sign Out

```javascript
// Client-side
window.location.href = "/api/auth/signout";
```

## Security Features

- **CSRF Protection**: Built-in CSRF token validation
- **Secure Cookies**: HttpOnly, Secure, SameSite protection
- **Session Management**: Database-stored sessions with 30-day expiry
- **Rate Limiting**: Subject to API rate limits

## Configuration

Authentication is configured in `src/server/auth/config.ts` with:

- Discord OAuth provider
- Database session storage
- Secure cookie settings
- Custom error/signin pages
