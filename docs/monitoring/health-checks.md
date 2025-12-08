# Health Check System

## Overview

The health check system provides real-time status information about the application and its dependencies, enabling monitoring, alerting, and automated recovery.

## Health Check Endpoint

### Endpoint Details

- **URL**: `GET /api/health`
- **Authentication**: None required (public endpoint)
- **Rate Limiting**: Subject to standard API limits
- **Response Format**: JSON

### Response Structure

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "responseTime": 45,
  "checks": {
    "database": {
      "status": "healthy"
    },
    "environment": {
      "status": "healthy",
      "message": "All required env vars present"
    }
  },
  "version": "1.0.0"
}
```

## Health Check Components

### Database Health Check

```typescript
// Database connectivity test
const dbCheck = await PerformanceMonitor.timeAsync(
  "health-check-db",
  async () => {
    await db.$queryRaw`SELECT 1`;
    return { status: "healthy" };
  },
);
```

**What it checks**:

- Database connection availability
- Query execution capability
- Connection pool status
- Response time measurement

### Environment Health Check

```typescript
// Environment variable validation
const envCheck = {
  status: process.env.DATABASE_URL ? "healthy" : "unhealthy",
  message: process.env.DATABASE_URL
    ? "All required env vars present"
    : "Missing DATABASE_URL",
};
```

**What it checks**:

- Required environment variables present
- Configuration validity
- Runtime environment status

## Health Status Determination

### Overall Status Logic

```typescript
const isHealthy = dbCheck.status === "healthy" && envCheck.status === "healthy";

const healthData = {
  status: isHealthy ? "healthy" : "unhealthy",
  // ... other fields
};
```

### Status Codes

- **200 OK**: All systems healthy
- **503 Service Unavailable**: One or more systems unhealthy

## Performance Monitoring

### Response Time Tracking

```typescript
const startTime = Date.now();
// ... health checks
const totalTime = Date.now() - startTime;

Logger.debug("Health check completed", {
  status: healthData.status,
  responseTime: totalTime,
});
```

### Performance Thresholds

- **Fast**: <100ms response time
- **Acceptable**: 100-500ms response time
- **Slow**: >500ms response time (investigate)

## Usage Examples

### Manual Health Check

```bash
# Basic health check
curl http://localhost:3000/api/health

# With response time measurement
curl -w "Response time: %{time_total}s\n" http://localhost:3000/api/health

# Check specific status code
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/api/health
```

### Monitoring Script

```bash
#!/bin/bash
# health-monitor.sh

ENDPOINT="http://localhost:3000/api/health"
THRESHOLD=500  # milliseconds

while true; do
  RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" $ENDPOINT)
  STATUS_CODE=$(curl -o /dev/null -s -w "%{http_code}" $ENDPOINT)

  RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)

  if [ "$STATUS_CODE" -eq 200 ]; then
    if [ $(echo "$RESPONSE_TIME_MS > $THRESHOLD" | bc) -eq 1 ]; then
      echo "⚠️  Health check slow: ${RESPONSE_TIME_MS}ms"
    else
      echo "✅ Health check OK: ${RESPONSE_TIME_MS}ms"
    fi
  else
    echo "❌ Health check failed: HTTP $STATUS_CODE"
  fi

  sleep 30
done
```

## Container Integration

### Docker Health Check

```dockerfile
# Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  app:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Kubernetes Probes

```yaml
# kubernetes deployment
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: app
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

## Load Balancer Integration

### AWS Application Load Balancer

```json
{
  "HealthCheckPath": "/api/health",
  "HealthCheckProtocol": "HTTP",
  "HealthCheckIntervalSeconds": 30,
  "HealthCheckTimeoutSeconds": 5,
  "HealthyThresholdCount": 2,
  "UnhealthyThresholdCount": 3
}
```

### NGINX Upstream Health Check

```nginx
upstream app_servers {
    server app1:3000;
    server app2:3000;

    # NGINX Plus health checks
    health_check uri=/api/health interval=30s;
}
```

## Monitoring Integration

### Uptime Monitoring Services

```javascript
// Pingdom, UptimeRobot, etc.
const monitoringConfig = {
  url: "https://your-app.vercel.app/api/health",
  interval: 60, // seconds
  timeout: 30,
  expectedStatus: 200,
  expectedContent: '"status":"healthy"',
};
```

### Prometheus Metrics

```typescript
// Future enhancement: Prometheus metrics endpoint
app.get("/metrics", (req, res) => {
  const metrics = `
# HELP app_health_status Application health status (1=healthy, 0=unhealthy)
# TYPE app_health_status gauge
app_health_status{component="database"} ${dbHealthy ? 1 : 0}
app_health_status{component="environment"} ${envHealthy ? 1 : 0}

# HELP app_health_response_time Health check response time in milliseconds
# TYPE app_health_response_time gauge
app_health_response_time ${responseTime}
  `;
  res.set("Content-Type", "text/plain");
  res.send(metrics);
});
```

## Alerting Configuration

### Sentry Alerts

```typescript
// Alert on health check failures
if (!isHealthy) {
  Sentry.captureMessage("Health check failed", {
    level: "error",
    tags: {
      component: "health-check",
      database_status: dbCheck.status,
      environment_status: envCheck.status,
    },
  });
}
```

### Custom Alert Thresholds

- **Critical**: Health check returns 503
- **Warning**: Health check response time >1000ms
- **Info**: Health check response time >500ms

## Troubleshooting

### Common Health Check Failures

**Database Connection Issues**

```bash
# Check database connectivity
docker ps | grep postgres
docker logs postgres-container

# Test direct connection
psql "postgresql://user:pass@localhost:5432/db"
```

#### **Environment Variable Issues**

```bash
# Check environment variables
printenv | grep DATABASE_URL
printenv | grep AUTH_SECRET

# Validate environment file
cat .env.local
```

#### **Network Issues**

```bash
# Test local connectivity
curl -v http://localhost:3000/api/health

# Test from different network
curl -v https://your-app.vercel.app/api/health
```

### Health Check Debugging

```typescript
// Enable detailed health check logging
Logger.info("Health check started", { timestamp: new Date().toISOString() });

try {
  const dbResult = await db.$queryRaw`SELECT 1`;
  Logger.info("Database check passed", { result: dbResult });
} catch (error) {
  Logger.error("Database check failed", {
    error: error instanceof Error ? error.message : String(error),
  });
}
```

## Advanced Health Checks

### Dependency Health Checks

```typescript
// Check external service dependencies
const externalChecks = await Promise.allSettled([
  checkSentryConnectivity(),
  checkDiscordOAuthStatus(),
  checkDatabaseMigrationStatus(),
]);

const dependencyStatus = externalChecks.map((result, index) => ({
  service: ["sentry", "discord", "migrations"][index],
  status: result.status === "fulfilled" ? "healthy" : "unhealthy",
  error: result.status === "rejected" ? result.reason : null,
}));
```

### Deep Health Checks

```typescript
// More comprehensive health validation
const deepChecks = {
  database: {
    connectivity: await testDatabaseConnection(),
    migrations: await checkMigrationStatus(),
    performance: await measureQueryPerformance(),
  },
  memory: {
    usage: process.memoryUsage(),
    heapUsed: process.memoryUsage().heapUsed / 1024 / 1024, // MB
  },
  disk: {
    available: await checkDiskSpace(),
    logs: await checkLogDirectory(),
  },
};
```

## Health Check Best Practices

### Design Principles

- **Fast execution**: Complete within 5 seconds
- **Minimal resource usage**: Don't impact application performance
- **Comprehensive coverage**: Check all critical dependencies
- **Clear status indication**: Unambiguous healthy/unhealthy states

### Security Considerations

- **No sensitive data**: Don't expose credentials or internal details
- **Rate limiting**: Prevent health check abuse
- **Access control**: Consider authentication for detailed health info

### Monitoring Strategy

- **Multiple check intervals**: Different frequencies for different components
- **Graceful degradation**: Partial functionality during component failures
- **Historical tracking**: Trend analysis of health check performance
