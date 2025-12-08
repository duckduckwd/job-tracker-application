# Health Check API

## Endpoint

`GET /api/health`

## Description

Returns the current health status of the application and its dependencies.

## Authentication

None required - public endpoint

## Rate Limiting

Subject to standard rate limiting (100 requests per 15 minutes)

## Request

```bash
curl -X GET http://localhost:3000/api/health
```

## Response

### Success Response (200)

```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX T10:00:00.000Z",
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

### Unhealthy Response (503)

```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-XX T10:00:00.000Z",
  "uptime": 3600,
  "responseTime": 1200,
  "checks": {
    "database": {
      "status": "unhealthy"
    },
    "environment": {
      "status": "healthy",
      "message": "All required env vars present"
    }
  },
  "version": "1.0.0"
}
```

### Error Response (503)

```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-XX T10:00:00.000Z",
  "error": "Health check failed",
  "responseTime": 5000
}
```

## Response Fields

| Field                | Type   | Description                                     |
| -------------------- | ------ | ----------------------------------------------- |
| `status`             | string | Overall health status: `healthy` or `unhealthy` |
| `timestamp`          | string | ISO 8601 timestamp of the health check          |
| `uptime`             | number | Server uptime in seconds                        |
| `responseTime`       | number | Health check response time in milliseconds      |
| `checks`             | object | Individual component health checks              |
| `checks.database`    | object | Database connectivity status                    |
| `checks.environment` | object | Environment configuration status                |
| `version`            | string | Application version                             |

## Usage Examples

### Monitoring Script

```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ $response -eq 200 ]; then
  echo "✅ Application is healthy"
else
  echo "❌ Application is unhealthy (HTTP $response)"
fi
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

### Load Balancer Configuration

Configure your load balancer to use `/api/health` for health checks with:

- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Healthy threshold**: 2 consecutive successes
- **Unhealthy threshold**: 3 consecutive failures
