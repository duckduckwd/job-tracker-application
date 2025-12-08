import * as Sentry from "@sentry/nextjs";

import type { SecurityEvent } from "~/types";

export class SecurityLogger {
  static log(event: SecurityEvent) {
    const logData = {
      timestamp: new Date().toISOString(),
      ...event,
    };

    // Console logging for development
    if (process.env.NODE_ENV === "development") {
      console.warn("🔒 Security Event:", logData);
    }

    // Send to Sentry for monitoring
    Sentry.addBreadcrumb({
      category: "security",
      message: `Security event: ${event.type}`,
      level: "warning",
      data: logData,
    });

    // For critical events, capture as Sentry issue
    if (event.type === "auth_failure" || event.type === "suspicious_request") {
      Sentry.captureMessage(`Security Alert: ${event.type}`, "warning");
    }
  }

  static logAuthFailure(
    ip: string,
    userAgent: string,
    details: Record<string, unknown>,
  ) {
    this.log({
      type: "auth_failure",
      ip,
      userAgent,
      details,
    });
  }

  static logRateLimit(ip: string, endpoint: string) {
    this.log({
      type: "rate_limit",
      ip,
      details: { endpoint },
    });
  }
}
