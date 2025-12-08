// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // requests per window
  CLEANUP_CHANCE: 0.01, // 1% chance to cleanup old entries
} as const;

// Performance Monitoring
export const PERFORMANCE = {
  THRESHOLDS: {
    DATABASE_QUERY: 500,
    API_REQUEST: 1000,
    FILE_UPLOAD: 5000,
    DEFAULT: 1000,
  },
  SENTRY_SAMPLE_RATE: 0.05, // 5% of operations
  METRICS_SAMPLE_RATE: 0.1, // 10% of metrics
} as const;

// Session Configuration
export const SESSION = {
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days
  UPDATE_AGE: 24 * 60 * 60, // 24 hours
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Auth Routes
export const AUTH_ROUTES = {
  ERROR: "/auth/error",
  SIGN_IN: "/auth/signin",
} as const;
