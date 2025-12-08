# Sentry Setup and Configuration

## Overview

Sentry provides error tracking, performance monitoring, and alerting for the application. The setup is optimised for the free tier while providing comprehensive monitoring capabilities.

## Sentry Account Setup

### Creating Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for free account
3. Create new project
4. Select "Next.js" as platform
5. Copy the DSN (Data Source Name)

### Free Tier Limits

- **5,000 errors per month**
- **10,000 performance transactions per month**
- **1 GB attachment storage**
- **30-day data retention**

## Installation and Configuration

### Sentry Wizard Setup

```bash
# Install Sentry SDK using wizard
npx @sentry/wizard@latest -i nextjs
```

The wizard automatically:

- Installs `@sentry/nextjs` package
- Creates configuration files
- Updates `next.config.js`
- Sets up environment variables

### Manual Configuration Files

**`sentry.client.config.ts`**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% sampling to stay within limits

  // Error filtering
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return event;
  },

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
```

**`sentry.server.config.ts`**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Server-side performance monitoring
  tracesSampleRate: 0.05, // 5% sampling for server

  // Error filtering
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return event;
  },

  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
```

**`sentry.edge.config.ts`**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

## Environment Variables

### Required Variables

```bash
# Sentry configuration
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
SENTRY_ORG="your-organisation-name"
SENTRY_PROJECT="your-project-name"

# Optional: Authentication token for releases
SENTRY_AUTH_TOKEN="your-auth-token"
```

### Environment Validation

The application validates Sentry configuration in `src/env.js`:

```typescript
server: {
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
}
```

## Integration with Application Loggers

### Logger Integration

```typescript
// In Logger class (~/lib/monitoring/logger.ts)
static log(level: LogLevel, message: string, context: LogContext = {}) {
  // ... console logging

  // Send to Sentry
  Sentry.addBreadcrumb({
    category: 'app',
    message,
    level: level === 'error' ? 'error' : 'info',
    data: logData,
  })

  // Capture errors in Sentry
  if (level === 'error') {
    Sentry.captureMessage(message, 'error')
  }
}
```

### Security Logger Integration

```typescript
// In SecurityLogger class (~/lib/security/security-logger.ts)
static log(event: SecurityEvent) {
  // ... console logging

  // Send to Sentry for monitoring
  Sentry.addBreadcrumb({
    category: 'security',
    message: `Security event: ${event.type}`,
    level: 'warning',
    data: logData,
  })

  // For critical events, capture as Sentry issue
  if (event.type === 'auth_failure' || event.type === 'suspicious_request') {
    Sentry.captureMessage(`Security Alert: ${event.type}`, 'warning')
  }
}
```

## Performance Monitoring Optimisation

### Sampling Strategy

```typescript
// Optimised for free tier usage
if (process.env.NODE_ENV === "production") {
  // Only capture slow operations as events (saves quota)
  if (duration > threshold) {
    Sentry.captureMessage(
      `Slow operation: ${operationName} (${Math.round(duration)}ms)`,
      "warning",
    );
  }

  // Sample 5% of normal operations for breadcrumbs
  if (Math.random() < 0.05) {
    Sentry.addBreadcrumb({
      category: "performance",
      message: `${operationName} completed`,
      level: "info",
      data: { duration: Math.round(duration) },
    });
  }
}
```

### Transaction Tracking

```typescript
// Track important user journeys
const transaction = Sentry.startTransaction({
  name: "job-application-creation",
  op: "user-action",
});

try {
  // Business logic
  const result = await createJobApplication(data);
  transaction.setStatus("ok");
  return result;
} catch (error) {
  transaction.setStatus("internal_error");
  Sentry.captureException(error);
  throw error;
} finally {
  transaction.finish();
}
```

## Error Handling and Reporting

### Automatic Error Capture

```typescript
// Errors are automatically captured by Sentry
try {
  await riskyOperation();
} catch (error) {
  // Automatically sent to Sentry
  Logger.error("Operation failed", {
    error: error instanceof Error ? error.message : String(error),
    operation: "riskyOperation",
  });
  throw error;
}
```

### Manual Error Reporting

```typescript
// Capture specific errors with context
Sentry.captureException(error, {
  tags: {
    component: "job-application",
    operation: "create",
  },
  user: {
    id: userId,
    email: userEmail,
  },
  extra: {
    jobData: sanitisedJobData,
  },
});
```

### Error Filtering

```typescript
// Filter out noise and development errors
beforeSend(event, hint) {
  // Skip development errors
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  // Filter out known non-critical errors
  if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
    return null;
  }

  // Rate limit similar errors
  if (shouldRateLimit(event)) {
    return null;
  }

  return event;
}
```

## Alerting Configuration

### Alert Rules

1. **Critical Errors**: New error types or high error rates
2. **Performance Issues**: Response times >2 seconds
3. **Security Events**: Authentication failures, rate limiting
4. **Availability**: Health check failures

### Notification Channels

- **Email**: Immediate notifications for critical issues
- **Slack**: Team notifications for errors and performance
- **Webhook**: Custom integrations for specific events

### Alert Thresholds

```javascript
// Example alert configurations
{
  "error_rate": {
    "threshold": "5%",
    "timeWindow": "5 minutes",
    "severity": "critical"
  },
  "response_time": {
    "threshold": "2000ms",
    "percentile": "95th",
    "timeWindow": "10 minutes",
    "severity": "warning"
  }
}
```

## Dashboard Configuration

### Key Metrics Dashboard

- **Error Rate**: Errors per minute/hour
- **Performance**: Response time percentiles
- **Availability**: Uptime percentage
- **User Impact**: Affected users count

### Custom Dashboards

```javascript
// Create custom dashboard for job application metrics
{
  "name": "Job Application Tracking",
  "widgets": [
    {
      "title": "Job Creation Errors",
      "query": "event.message:\"Job creation failed\""
    },
    {
      "title": "Authentication Issues",
      "query": "event.tags.component:\"auth\""
    },
    {
      "title": "Performance by Endpoint",
      "query": "transaction.op:\"http.server\""
    }
  ]
}
```

## Release Tracking

### Automatic Release Creation

```bash
# In CI/CD pipeline
sentry-cli releases new $VERCEL_GIT_COMMIT_SHA
sentry-cli releases set-commits $VERCEL_GIT_COMMIT_SHA --auto
sentry-cli releases finalize $VERCEL_GIT_COMMIT_SHA
```

### Release Configuration

```typescript
// In Sentry configuration
{
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  environment: process.env.NODE_ENV,
}
```

## Debugging with Sentry

### Using Breadcrumbs

```typescript
// Add custom breadcrumbs for debugging
Sentry.addBreadcrumb({
  message: "User started job application",
  category: "user-action",
  data: {
    userId: user.id,
    timestamp: new Date().toISOString(),
  },
});
```

### Context Information

```typescript
// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Set additional context
Sentry.setContext("job_application", {
  company: jobData.company,
  position: jobData.position,
  status: jobData.status,
});
```

## Quota Management

### Monitoring Usage

- Check Sentry dashboard for quota usage
- Set up alerts when approaching limits
- Monitor error and transaction volumes

### Optimisation Strategies

```typescript
// Reduce quota usage
const optimisations = {
  sampling: 0.1, // 10% of transactions
  errorFiltering: true, // Filter non-critical errors
  breadcrumbLimiting: 50, // Limit breadcrumbs per event
  attachmentLimits: "1MB", // Limit attachment sizes
};
```

## Troubleshooting

### Common Issues

#### **DSN Not Working**

- Verify DSN format and project ID
- Check environment variable loading
- Confirm network connectivity

#### **High Quota Usage**

- Review sampling rates
- Implement error filtering
- Check for error loops

#### **Missing Events**

- Verify beforeSend filters
- Check environment configuration
- Confirm Sentry initialisation

### Debug Mode

```typescript
// Enable debug logging
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: process.env.NODE_ENV === "development",
  // ... other config
});
```

## Best Practices

### Error Reporting

- **Add context**: Include relevant user and application state
- **Filter noise**: Remove non-actionable errors
- **Group similar errors**: Use fingerprinting for better organisation

### Performance Monitoring

- **Sample appropriately**: Balance visibility with quota usage
- **Track key metrics**: Focus on user-impacting performance
- **Set meaningful thresholds**: Alert on actual problems

### Security

- **Sanitise data**: Remove sensitive information from error reports
- **Control access**: Limit Sentry project access
- **Monitor alerts**: Respond to security-related events promptly
