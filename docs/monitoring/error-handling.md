# Error Handling & Boundaries

## Overview

This project implements comprehensive error handling through React Error Boundaries, providing graceful error recovery and automatic error reporting to Sentry.

## Error Boundary Components

### ErrorBoundary (Main)

The primary error boundary component that catches JavaScript errors anywhere in the component tree.

```typescript
import { ErrorBoundary } from '@/components';

// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorPage />}>
  <YourComponent />
</ErrorBoundary>

// With error handler
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling logic
    console.log('Error caught:', error);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### ApiErrorBoundary (Specialized)

Specialized error boundary for API-related components with appropriate fallback UI.

```typescript
import { ApiErrorBoundary } from '@/components';

<ApiErrorBoundary>
  <UserDashboard />
  <DataTable />
</ApiErrorBoundary>
```

## Implementation Patterns

### Application Level

```typescript
// src/app/layout.tsx
import { ErrorBoundary } from '@/components';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Page Level

```typescript
// src/app/dashboard/page.tsx
import { ApiErrorBoundary } from '@/components';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ApiErrorBoundary>
        <DashboardContent />
      </ApiErrorBoundary>
    </div>
  );
}
```

### Component Level

```typescript
// For critical components
<ErrorBoundary
  fallback={
    <div className="p-4 text-center">
      <p>This feature is temporarily unavailable</p>
    </div>
  }
>
  <CriticalFeature />
</ErrorBoundary>
```

## Error Reporting Integration

### Sentry Integration

Error boundaries automatically report errors to Sentry with:

- **Error details** and stack traces
- **Component stack** information
- **User context** and session data
- **Performance impact** metrics

```typescript
// Automatic Sentry reporting in ErrorBoundary
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```

### Custom Error Context

```typescript
// Add custom context to error reports
<ErrorBoundary
  onError={(error, errorInfo) => {
    Sentry.setContext('feature', {
      name: 'user-dashboard',
      version: '1.2.0',
    });
  }}
>
  <UserDashboard />
</ErrorBoundary>
```

## Error Recovery Mechanisms

### Automatic Recovery

Error boundaries provide "Try again" functionality:

```typescript
// Built-in recovery button
<button
  onClick={() => this.setState({ hasError: false })}
  className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
>
  Try again
</button>
```

### Custom Recovery

```typescript
// Custom recovery logic
const handleRetry = () => {
  // Clear error state
  setError(null);
  // Refetch data
  refetch();
  // Reset component state
  reset();
};
```

## Error Boundary Best Practices

### Placement Strategy

1. **Root level** - Catch all unhandled errors
2. **Page level** - Isolate page-specific errors
3. **Feature level** - Protect critical features
4. **Component level** - Granular error handling

### Fallback UI Guidelines

```typescript
// Good: Informative and actionable
<div className="text-center p-8">
  <h2>Unable to load dashboard</h2>
  <p>Please check your connection and try again</p>
  <button onClick={retry}>Retry</button>
</div>

// Avoid: Generic or unhelpful
<div>Something went wrong</div>
```

### Error Context

```typescript
// Provide helpful context
<ErrorBoundary
  fallback={
    <ErrorFallback
      title="Dashboard Error"
      message="Unable to load your dashboard data"
      action="retry"
    />
  }
>
  <Dashboard />
</ErrorBoundary>
```

## Testing Error Boundaries

### Development Testing

```typescript
// Create error-throwing component for testing
function ErrorThrower() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error for boundary');
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Throw Error
    </button>
  );
}
```

### Unit Testing

```typescript
// Test error boundary behavior
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components';

const ThrowError = () => {
  throw new Error('Test error');
};

test('displays error fallback when child throws', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

## Error Types and Handling

### JavaScript Errors

- **Runtime errors** - Caught by error boundaries
- **Promise rejections** - Require separate handling
- **Async errors** - Need try/catch blocks

### API Errors

```typescript
// API error handling with boundaries
<ApiErrorBoundary>
  <Suspense fallback={<Loading />}>
    <DataComponent />
  </Suspense>
</ApiErrorBoundary>
```

### Network Errors

```typescript
// Network-specific error handling
const NetworkErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div className="text-center">
        <p>Network connection issue</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
```

## Monitoring and Alerts

### Error Metrics

Track error boundary activations:

- **Error frequency** by component
- **Recovery success rate**
- **User impact** assessment
- **Error patterns** over time

### Sentry Dashboard

Monitor errors through Sentry:

- **Real-time error tracking**
- **Error grouping** and deduplication
- **Performance impact** analysis
- **User session replay**

## Troubleshooting

### Common Issues

#### Error Boundaries Not Catching Errors

```typescript
// Error boundaries don't catch:
- Event handlers (use try/catch)
- Asynchronous code (use try/catch)
- Server-side rendering errors
- Errors in the error boundary itself
```

#### Recovery Not Working

```typescript
// Ensure proper state reset
const handleRetry = () => {
  // Reset all relevant state
  setError(null);
  setData(null);
  setLoading(false);
  // Trigger re-render
  forceUpdate();
};
```

### Debugging Tips

```typescript
// Add logging for debugging
componentDidCatch(error, errorInfo) {
  console.group('Error Boundary Caught Error');
  console.error('Error:', error);
  console.error('Error Info:', errorInfo);
  console.groupEnd();

  // Report to Sentry
  Sentry.captureException(error, { contexts: { react: errorInfo } });
}
```

This comprehensive error handling system ensures graceful degradation and maintains user experience even when errors occur.
