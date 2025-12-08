# Logging System

## Overview

The application uses a structured logging system with multiple loggers for different purposes: general application logging and security-specific logging.

## Logger Architecture

### Dual Logger System

- **Logger** (`~/lib/monitoring/logger.ts`) - General application logging
- **SecurityLogger** (`~/lib/security/security-logger.ts`) - Security-specific events

### Log Destinations

- **Development**: Coloured console output
- **Production**: Console output + Sentry integration
- **No file logging**: Cloud-native approach

## General Application Logger

### Usage Examples

```typescript
import { Logger } from "~/lib/monitoring/logger";

// Different log levels
Logger.debug("Debug information", { userId: "123", action: "view" });
Logger.info("User action completed", { userId: "123", duration: 150 });
Logger.warn("Slow operation detected", {
  operation: "database-query",
  duration: 2000,
});
Logger.error("Operation failed", {
  error: "Connection timeout",
  userId: "123",
});
```

### Log Structure

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User action completed",
  "requestId": "abc123def456",
  "userId": "123",
  "duration": 150
}
```

### Context Fields

- **requestId**: Unique identifier for request correlation
- **userId**: User performing the action (when available)
- **duration**: Operation timing in milliseconds
- **Custom fields**: Any additional context data

## Security Logger

### Usage Examples

```typescript
import { SecurityLogger } from "~/lib/security/security-logger";

// Security-specific events
SecurityLogger.logAuthFailure(ip, userAgent, {
  provider: "discord",
  reason: "invalid_credentials",
});
SecurityLogger.logRateLimit(ip, "/api/users");
SecurityLogger.log({
  type: "suspicious_request",
  ip: "192.168.1.100",
  userAgent: "curl/7.68.0",
  details: { endpoint: "/api/admin", method: "POST" },
});
```

### Security Event Types

- **auth_failure**: Failed authentication attempts
- **rate_limit**: Rate limiting violations
- **suspicious_request**: Unusual request patterns
- **data_access**: Sensitive data access events

## Log Levels

### Development Environment

All log levels are displayed with colour coding:

- **DEBUG**: Cyan - Detailed debugging information
- **INFO**: Green - General information
- **WARN**: Yellow - Warning conditions
- **ERROR**: Red - Error conditions

### Production Environment

- **INFO and above**: Logged to console and Sentry
- **DEBUG**: Filtered out for performance
- **ERROR**: Automatically captured as Sentry issues

## Request Correlation

### Request ID Generation

Every request gets a unique ID for tracing:

```typescript
const requestId = Math.random().toString(36).substring(2, 15);
```

### Request Tracing Flow

1. **Middleware**: Generates request ID
2. **Logger**: Includes request ID in all logs
3. **Response**: Returns request ID in `x-request-id` header
4. **Debugging**: Use request ID to trace across logs

### Example Request Flow

```text
[INFO] Request started { requestId: "abc123", method: "GET", url: "/api/users" }
[INFO] Database query executed { requestId: "abc123", duration: 45, query: "SELECT * FROM users" }
[INFO] Request completed { requestId: "abc123", status: 200, duration: 67 }
```

## Sentry Integration

### Configuration

```typescript
// Automatic Sentry integration in loggers
Sentry.addBreadcrumb({
  category: "app",
  message: logMessage,
  level: logLevel,
  data: contextData,
});

// Error capture
if (level === "error") {
  Sentry.captureMessage(message, "error");
}
```

### Breadcrumb Trail

Sentry automatically collects breadcrumbs from logs to provide context when errors occur:

- Last 100 log entries before error
- Request correlation data
- User context when available

## Log Analysis

### Development Debugging

```bash
# Start development server with logs
npm run dev

# Filter logs by level
npm run dev | grep "ERROR"

# Search for specific request
npm run dev | grep "abc123"
```

### Production Log Analysis

```bash
# View application logs (Vercel)
vercel logs

# Filter by time range
vercel logs --since=1h

# Follow live logs
vercel logs --follow
```

### Sentry Queries

```text
# Find all errors for specific user
user.id:"123"

# Find slow operations
message:"Slow operation detected"

# Find rate limiting events
message:"Rate limit exceeded"
```

## Performance Logging

### Automatic Performance Tracking

```typescript
// Automatic timing in PerformanceMonitor
const timerId = PerformanceMonitor.startTimer("database-query");
// ... operation
const duration = PerformanceMonitor.endTimer(timerId);

// Logs: "Performance: database-query { duration: 45, operation: 'database-query' }"
```

### Custom Performance Metrics

```typescript
PerformanceMonitor.trackMetric({
  name: "user_registration",
  value: 1,
  unit: "count",
  tags: { provider: "discord" },
});
```

## Log Retention

### Development

- **Console logs**: Lost when process restarts
- **No persistence**: Logs not saved to disk

### Production

- **Vercel**: 7-day log retention on free tier
- **Sentry**: 30-day retention on free tier
- **Custom retention**: Export logs for longer storage if needed

## Best Practices

### What to Log

```typescript
// ✅ Good logging
Logger.info("User created job application", {
  userId: user.id,
  jobId: job.id,
  company: job.company,
  duration: 150,
});

// ❌ Avoid logging sensitive data
Logger.info("User login", {
  email: user.email, // ❌ PII
  password: password, // ❌ Sensitive
  sessionToken: token, // ❌ Security risk
});
```

### Log Message Format

- **Use consistent tense**: "User created job" not "Creating job"
- **Include context**: Always add relevant data
- **Be specific**: "Database connection failed" not "Error occurred"
- **Use structured data**: Objects instead of string concatenation

### Performance Considerations

```typescript
// ✅ Efficient logging
Logger.debug("Processing items", { count: items.length });

// ❌ Expensive logging
Logger.debug("Processing items", { items: JSON.stringify(items) });
```

## Monitoring Dashboards

### Key Metrics to Track

- **Error rate**: Errors per minute/hour
- **Response times**: P50, P95, P99 percentiles
- **Request volume**: Requests per minute
- **Authentication events**: Success/failure rates

### Sentry Dashboard Setup

1. **Performance**: Track slow operations
2. **Errors**: Monitor error frequency and types
3. **Releases**: Track errors by deployment
4. **Alerts**: Set up notifications for critical issues

## Troubleshooting with Logs

### Common Debugging Scenarios

#### **Finding Slow Requests**

```bash
# Search for slow operations
grep "Slow operation detected" logs.txt

# Find requests over 1 second
grep "duration.*[1-9][0-9][0-9][0-9]" logs.txt
```

#### **Tracing User Issues**

```bash
# Find all logs for specific user
grep "userId.*123" logs.txt

# Trace specific request
grep "requestId.*abc123" logs.txt
```

#### **Security Investigation**

```bash
# Find authentication failures
grep "auth_failure" logs.txt

# Find rate limiting events
grep "Rate limit exceeded" logs.txt
```

## Log Configuration

### Environment Variables

```bash
# Control log levels
LOG_LEVEL=debug  # development
LOG_LEVEL=info   # production

# Disable specific loggers
DISABLE_SECURITY_LOGGING=false
DISABLE_PERFORMANCE_LOGGING=false
```

### Runtime Configuration

```typescript
// Adjust logging based on environment
const logLevel = process.env.NODE_ENV === "development" ? "debug" : "info";
const enableSentry = process.env.NODE_ENV === "production";
```

## Future Enhancements

### Structured Logging Improvements

- **Log aggregation**: Centralised log collection
- **Log parsing**: Automated log analysis
- **Custom dashboards**: Application-specific metrics

### Advanced Features

- **Log sampling**: Reduce volume in high-traffic scenarios
- **Log encryption**: Encrypt sensitive log data
- **Log forwarding**: Send logs to multiple destinations
