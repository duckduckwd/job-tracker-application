# Rate Limiting

## Overview

Rate limiting protects the application from abuse, brute force attacks, and denial of service attempts by limiting the number of requests per client.

## Implementation Details

### Current Configuration

- **Limit**: 100 requests per 15-minute window
- **Scope**: Per IP address
- **Target**: API routes only (`/api/*`)
- **Storage**: In-memory (development), Redis recommended for production

### Rate Limiting Algorithm

#### **Sliding Window Counter**

- Window size: 15 minutes (900,000 milliseconds)
- Counter resets every window
- Requests tracked per IP per window

### Code Location

- **Middleware**: `src/middleware/rateLimiting.ts`
- **Integration**: `src/middleware.ts`

## How It Works

### Request Processing

1. Extract client IP from headers
2. Generate window key: `${ip}:${currentWindow}`
3. Check current request count for window
4. If under limit: increment counter, allow request
5. If over limit: return 429 status with retry-after header

### IP Address Detection

```typescript
const ip =
  request.headers.get("x-forwarded-for") ??
  request.headers.get("x-real-ip") ??
  "127.0.0.1";
```

**Header Priority**:

1. `x-forwarded-for` - Standard proxy header
2. `x-real-ip` - Alternative proxy header
3. `127.0.0.1` - Fallback for local development

### Window Calculation

```typescript
const windowMs = 15 * 60 * 1000; // 15 minutes
const key = `${ip}:${Math.floor(Date.now() / windowMs)}`;
```

## Response Behaviour

### Successful Request (Under Limit)

```http
HTTP/1.1 200 OK
x-request-id: abc123def456
Content-Type: application/json

{
  "data": "response data"
}
```

### Rate Limited Request (Over Limit)

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 847
x-request-id: abc123def456
Content-Type: text/plain

Too Many Requests
```

### Headers Explained

- **Retry-After**: Seconds until window resets
- **x-request-id**: Request correlation ID for debugging

## Security Logging

### Rate Limit Violations

All rate limit violations are logged for security monitoring:

```typescript
SecurityLogger.logRateLimit(ip, request.nextUrl.pathname);
```

### Log Data Captured

- Client IP address
- Requested endpoint
- Timestamp
- Request ID for correlation

### Monitoring Integration

- **Development**: Console logs with coloured output
- **Production**: Sentry alerts for repeated violations

## Configuration Options

### Adjustable Parameters

```typescript
const windowMs = 15 * 60 * 1000; // Window size in milliseconds
const maxRequests = 100; // Max requests per window
```

### Environment-Specific Limits

```typescript
const limits = {
  development: 1000, // Higher limit for development
  test: 10000, // Very high for testing
  production: 100, // Strict production limit
};

const maxRequests = limits[process.env.NODE_ENV] || 100;
```

## Memory Management

### Cleanup Strategy

```typescript
// Cleanup old entries (1% chance per request)
if (Math.random() < 0.01) {
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < Date.now()) {
      rateLimitMap.delete(key);
    }
  }
}
```

### Memory Considerations

- **Development**: In-memory storage acceptable
- **Production**: Consider Redis for persistence and scaling
- **Cleanup**: Automatic cleanup prevents memory leaks

## Production Scaling

### Redis Implementation

For production deployments with multiple instances:

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimitMiddleware(request: NextRequest) {
  const key = `rate_limit:${ip}:${window}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowMs / 1000);
  }

  if (current > maxRequests) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  return null;
}
```

### Benefits of Redis

- **Persistence**: Survives application restarts
- **Scaling**: Shared state across multiple instances
- **Performance**: Optimised for counter operations

## Bypass Mechanisms

### Development Bypass

```typescript
if (
  process.env.NODE_ENV === "development" &&
  process.env.DISABLE_RATE_LIMITING === "true"
) {
  return null; // Skip rate limiting
}
```

### Whitelist Implementation

```typescript
const whitelist = ["127.0.0.1", "::1"]; // Localhost IPs

if (whitelist.includes(ip)) {
  return null; // Skip rate limiting for whitelisted IPs
}
```

## Attack Scenarios

### Brute Force Protection

- **Login attempts**: Rate limiting prevents password guessing
- **API enumeration**: Limits reconnaissance attempts
- **Account creation**: Prevents automated account creation

### DDoS Mitigation

- **Request flooding**: Limits requests per IP
- **Resource exhaustion**: Prevents server overload
- **Bandwidth consumption**: Reduces attack impact

### Distributed Attacks

- **Multiple IPs**: Each IP limited independently
- **Proxy detection**: Headers help identify real client IP
- **Legitimate traffic**: Doesn't block normal usage patterns

## Monitoring and Alerting

### Key Metrics

- **Rate limit hits per hour**
- **Top rate-limited IPs**
- **Endpoint-specific violations**
- **False positive rate**

### Alert Thresholds

- **Warning**: >10 violations per hour from single IP
- **Critical**: >100 violations per hour across all IPs
- **Investigation**: Repeated violations from same IP

### Dashboard Queries

```javascript
// Sentry query for rate limit violations
event.message:"Rate limit exceeded"
AND event.tags.ip:EXISTS
```

## Testing Rate Limits

### Manual Testing

```bash
# Test rate limiting with curl
for i in {1..105}; do
  echo "Request $i:"
  curl -w "%{http_code}\n" -o /dev/null -s http://localhost:3000/api/health
  sleep 0.1
done
```

### Automated Testing

```javascript
// Jest test for rate limiting
test("should rate limit after 100 requests", async () => {
  const requests = Array(101)
    .fill()
    .map(() => fetch("/api/health"));

  const responses = await Promise.all(requests);
  const lastResponse = responses[responses.length - 1];

  expect(lastResponse.status).toBe(429);
  expect(lastResponse.headers.get("retry-after")).toBeTruthy();
});
```

## Common Issues

### False Positives

**Problem**: Legitimate users getting rate limited
**Solutions**:

- Increase limits for authenticated users
- Implement user-based rate limiting
- Add bypass for trusted IPs

### Proxy Issues

**Problem**: All requests appear from same IP
**Solutions**:

- Configure proxy headers correctly
- Use multiple header sources
- Implement user-based limiting

### Memory Leaks

**Problem**: Rate limit map grows indefinitely
**Solutions**:

- Implement cleanup mechanism
- Use TTL-based storage (Redis)
- Monitor memory usage

## Future Enhancements

### Adaptive Rate Limiting

- Adjust limits based on server load
- Different limits for different endpoints
- User reputation-based limits

### Advanced Features

- **Burst allowance**: Allow short bursts above limit
- **Gradual backoff**: Increase delays for repeated violations
- **Geographic limiting**: Different limits by region

### Integration Improvements

- **User-based limiting**: Limits per authenticated user
- **API key limiting**: Different limits per API key
- **Endpoint-specific limits**: Custom limits per route
