# Performance Monitoring

## Overview

The application includes comprehensive performance monitoring to track operation timing, identify bottlenecks, and ensure optimal user experience.

## Performance Monitor System

### Core Components

- **PerformanceMonitor** (`~/lib/monitoring/performance.ts`) - Main performance tracking
- **Automatic timing** - Built-in operation measurement
- **Custom metrics** - Business-specific measurements
- **Sentry integration** - Performance data in monitoring dashboard

## Operation Timing

### Basic Timer Usage

```typescript
import { PerformanceMonitor } from "~/lib/monitoring/performance";

// Manual timing
const timerId = PerformanceMonitor.startTimer("database-query");
const result = await db.user.findMany();
const duration = PerformanceMonitor.endTimer(timerId, {
  query: "findMany",
  table: "user",
});
```

### Async Operation Timing

```typescript
// Automatic timing for async operations
const users = await PerformanceMonitor.timeAsync(
  "user-fetch",
  async () => {
    return await db.user.findMany({ where: { active: true } });
  },
  { filter: "active-users" },
);
```

### Performance Thresholds

```typescript
// Configurable slow operation thresholds
const thresholds = {
  "database-query": 500, // 500ms for database operations
  "api-request": 1000, // 1s for API requests
  "file-upload": 5000, // 5s for file operations
  default: 1000, // 1s default threshold
};
```

## Custom Metrics

### Tracking Business Metrics

```typescript
// Track custom application metrics
PerformanceMonitor.trackMetric({
  name: "job_application_created",
  value: 1,
  unit: "count",
  tags: {
    company: "TechCorp",
    status: "applied",
    source: "manual",
  },
});

// Track performance metrics
PerformanceMonitor.trackMetric({
  name: "database_connection_pool",
  value: 8,
  unit: "count",
  tags: {
    pool: "primary",
    status: "active",
  },
});
```

### Metric Types

- **Counters**: Incrementing values (requests, errors)
- **Gauges**: Point-in-time values (memory usage, connections)
- **Timers**: Duration measurements (response times)
- **Histograms**: Distribution of values (request sizes)

## Automatic Performance Tracking

### Request-Level Monitoring

```typescript
// Automatic request timing in middleware
export function tracingMiddleware(request: NextRequest) {
  const startTime = Date.now();

  // ... request processing

  const duration = Date.now() - startTime;
  PerformanceMonitor.trackMetric({
    name: "request_duration",
    value: duration,
    unit: "ms",
    tags: {
      method: request.method,
      endpoint: request.nextUrl.pathname,
      status: response.status.toString(),
    },
  });
}
```

### Database Performance

```typescript
// Automatic database query timing
const result = await PerformanceMonitor.timeAsync(
  "database-query",
  () =>
    db.jobApplication.findMany({
      where: { userId },
      include: { contacts: true },
    }),
  {
    operation: "findMany",
    table: "jobApplication",
    userId,
  },
);
```

## Performance Alerts

### Slow Operation Detection

```typescript
// Automatic alerts for slow operations
if (duration > threshold) {
  Logger.warn(`Slow operation detected: ${operationName}`, {
    duration: Math.round(duration),
    threshold,
    ...context,
  });

  // Send to Sentry for critical operations
  if (process.env.NODE_ENV === "production") {
    Sentry.captureMessage(
      `Slow operation: ${operationName} (${Math.round(duration)}ms)`,
      "warning",
    );
  }
}
```

### Alert Thresholds

- **Database queries**: >500ms
- **API requests**: >1000ms
- **File operations**: >5000ms
- **Page loads**: >2000ms

## Sentry Performance Integration

### Optimised for Free Tier

```typescript
// Only send critical performance data to Sentry
if (process.env.NODE_ENV === "production") {
  // Only capture slow operations as events
  if (duration > threshold) {
    Sentry.captureMessage(`Slow operation: ${operationName}`, "warning");
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

### Performance Transactions

```typescript
// Sentry transaction for complex operations
const transaction = Sentry.startTransaction({
  name: "job-application-creation",
  op: "business-logic",
});

try {
  // ... business logic
  transaction.setStatus("ok");
} catch (error) {
  transaction.setStatus("internal_error");
  throw error;
} finally {
  transaction.finish();
}
```

## Performance Metrics

### Key Performance Indicators

- **Response Time**: P50, P95, P99 percentiles
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Availability**: Uptime percentage

### Database Performance

- **Query execution time**: Average and percentiles
- **Connection pool usage**: Active/idle connections
- **Slow query count**: Queries exceeding thresholds
- **Database size**: Growth over time

### Application Performance

- **Memory usage**: Heap size and garbage collection
- **CPU utilisation**: Process CPU percentage
- **Event loop lag**: Node.js event loop delay
- **Cache hit rate**: Application cache effectiveness

## Performance Testing

### Load Testing

```javascript
// Example load test with Artillery
// artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'API Load Test'
    requests:
      - get:
          url: '/api/health'
      - get:
          url: '/api/auth/session'
```

### Performance Benchmarks

```typescript
// Jest performance tests
test("should respond to health check within 100ms", async () => {
  const start = Date.now();
  const response = await fetch("/api/health");
  const duration = Date.now() - start;

  expect(response.status).toBe(200);
  expect(duration).toBeLessThan(100);
});

test("should handle concurrent requests efficiently", async () => {
  const requests = Array(50)
    .fill()
    .map(() => fetch("/api/health"));
  const start = Date.now();

  await Promise.all(requests);
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(5000); // 50 requests in under 5 seconds
});
```

## Performance Optimisation

### Database Optimisation

```typescript
// Efficient database queries
const jobs = await db.jobApplication.findMany({
  select: {
    id: true,
    company: true,
    position: true,
    status: true,
    appliedDate: true,
  },
  where: { userId },
  orderBy: { appliedDate: "desc" },
  take: 20, // Pagination
});

// Use indexes for common queries
// @@index([userId, status])
// @@index([appliedDate])
```

### Caching Strategies

```typescript
// In-memory caching for expensive operations
const cache = new Map();

async function getCachedUserStats(userId: string) {
  const cacheKey = `user-stats-${userId}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const stats = await PerformanceMonitor.timeAsync(
    "user-stats-calculation",
    () => calculateUserStats(userId),
  );

  cache.set(cacheKey, stats);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000); // 5 min TTL

  return stats;
}
```

## Performance Monitoring Dashboard

### Key Metrics to Display

- **Real-time response times**
- **Request volume over time**
- **Error rate trends**
- **Slow operation alerts**
- **Database performance**

### Sentry Performance Dashboard

1. **Transactions**: Track key user journeys
2. **Web Vitals**: Core web vitals metrics
3. **Database**: Query performance insights
4. **Alerts**: Performance degradation notifications

## Troubleshooting Performance Issues

### Identifying Bottlenecks

```bash
# Find slow operations in logs
grep "Slow operation detected" logs.txt

# Analyse request patterns
grep "request_duration" logs.txt | sort -k5 -n

# Database performance analysis
grep "database-query" logs.txt | awk '{print $5}' | sort -n
```

### Common Performance Issues

#### **Slow Database Queries**

- Missing indexes on frequently queried columns
- N+1 query problems
- Large result sets without pagination

#### **Memory Leaks**

- Unclosed database connections
- Growing cache without TTL
- Event listeners not removed

#### **High CPU Usage**

- Inefficient algorithms
- Synchronous operations blocking event loop
- Large JSON parsing operations

## Performance Best Practices

### Code Optimisation

```typescript
// ✅ Efficient async operations
const [users, jobs, contacts] = await Promise.all([
  db.user.findMany(),
  db.jobApplication.findMany(),
  db.contact.findMany(),
]);

// ❌ Sequential operations
const users = await db.user.findMany();
const jobs = await db.jobApplication.findMany();
const contacts = await db.contact.findMany();
```

### Resource Management

```typescript
// ✅ Proper resource cleanup
try {
  const result = await expensiveOperation();
  return result;
} finally {
  await cleanup();
}

// ✅ Connection pooling
const db = new PrismaClient({
  datasources: {
    db: {
      url: `${DATABASE_URL}?connection_limit=10&pool_timeout=10`,
    },
  },
});
```

## Future Performance Enhancements

### Advanced Monitoring

- **Real User Monitoring (RUM)**: Client-side performance tracking
- **Synthetic Monitoring**: Automated performance testing
- **APM Integration**: Application Performance Monitoring tools

### Optimisation Opportunities

- **CDN Integration**: Static asset optimisation
- **Database Read Replicas**: Distribute read operations
- **Caching Layers**: Redis for application caching
- **Code Splitting**: Reduce initial bundle size
