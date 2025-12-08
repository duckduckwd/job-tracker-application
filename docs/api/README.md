# API Documentation

## Overview

Job Application Tracker REST API built with Next.js 14 App Router.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

## Authentication

All protected endpoints require authentication via NextAuth.js session cookies.

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `Retry-After` header included when rate limited
- **Status**: `429 Too Many Requests` when exceeded

## Request/Response Format

- **Content-Type**: `application/json`
- **Request ID**: All responses include `x-request-id` header for tracing

## Error Responses

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-XX T10:00:00.000Z",
  "requestId": "abc123"
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable (health check failed)

## Endpoints

### System Health Details

- [Health Check](./health.md) - `GET /api/health`

### Authentication Details

- [Authentication](./auth.md) - NextAuth.js endpoints

### Job Applications

_Coming soon - will be documented as features are built_
