# Analytics API

## Endpoint

`POST /api/analytics`

## Description

Collects anonymous usage analytics for application improvement. No personally identifiable information is stored.

## Authentication

None required - public endpoint

## Rate Limiting

Subject to standard rate limiting (100 requests per 15 minutes)

## Request

```bash
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "event": "form_submitted",
    "properties": {
      "form_type": "job_application",
      "completion_time": 120000,
      "sections_completed": 3
    }
  }'
```

## Request Body

```json
{
  "event": "string",
  "properties": {
    "key": "value"
  }
}
```

### Event Types

| Event                    | Description                 | Properties                     |
| ------------------------ | --------------------------- | ------------------------------ |
| `page_view`              | Page navigation             | `page`, `referrer`             |
| `form_started`           | Form interaction began      | `form_type`                    |
| `form_section_completed` | Form section finished       | `section`, `form_type`         |
| `form_submitted`         | Form successfully submitted | `form_type`, `completion_time` |
| `form_abandoned`         | Form left incomplete        | `form_type`, `completion_rate` |
| `error_occurred`         | Application error           | `error_type`, `component`      |

## Response

### Success Response (200)

```json
{
  "success": true,
  "timestamp": "2024-12-08T10:00:00.000Z"
}
```

### Validation Error (400)

```json
{
  "error": "Invalid event data",
  "details": [
    {
      "field": "event",
      "message": "Event name is required"
    }
  ]
}
```

## Privacy & Data Handling

- **No PII**: No personally identifiable information is collected
- **Anonymous**: Events are not linked to user accounts
- **Aggregated**: Data is used for aggregate analytics only
- **Retention**: Analytics data retained for 90 days maximum
- **Opt-out**: Users can disable analytics in application settings

## Usage Examples

### Track Form Completion

```javascript
// Client-side tracking
const trackFormCompletion = async (formType, completionTime) => {
  await fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "form_submitted",
      properties: {
        form_type: formType,
        completion_time: completionTime,
        timestamp: new Date().toISOString(),
      },
    }),
  });
};
```

### Track Page Views

```javascript
// Track navigation
const trackPageView = async (page) => {
  await fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "page_view",
      properties: {
        page,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      },
    }),
  });
};
```

## Implementation Status

**Current**: Basic endpoint implemented with validation  
**Future**: Enhanced analytics dashboard and reporting features
