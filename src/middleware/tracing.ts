import { type NextRequest, NextResponse } from "next/server";

import { Logger } from "~/lib/monitoring/logger";
import { PerformanceMonitor } from "~/lib/monitoring/performance";

export function tracingMiddleware(request: NextRequest): NextResponse {
  const requestId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();

  // Extract request info
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const method = request.method;
  const url = request.nextUrl.pathname;

  // Log request start
  Logger.info("Request started", {
    requestId,
    method,
    url,
    ip,
    userAgent,
  });

  // Create response with request ID header
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);

  // Log request completion (this runs after the request)
  const duration = Date.now() - startTime;
  Logger.info("Request completed", {
    requestId,
    method,
    url,
    duration,
    status: response.status,
  });

  // Track performance
  PerformanceMonitor.trackMetric({
    name: "request_duration",
    value: duration,
    unit: "ms",
    tags: {
      method,
      endpoint: url,
      status: response.status.toString(),
    },
  });

  return response;
}
