import { type NextRequest, NextResponse } from "next/server";

import { HTTP_STATUS, RATE_LIMIT } from "~/constants";
import { SecurityLogger } from "~/lib/security/security-logger";

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const windowMs = RATE_LIMIT.WINDOW_MS;
  const maxRequests = RATE_LIMIT.MAX_REQUESTS;

  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const current = rateLimitMap.get(key) ?? {
    count: 0,
    resetTime: now + windowMs,
  };

  if (current.count >= maxRequests) {
    // Log the rate limit event
    SecurityLogger.logRateLimit(ip, request.nextUrl.pathname);

    return new NextResponse("Too Many Requests", {
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
      headers: {
        "Retry-After": Math.ceil((current.resetTime - now) / 1000).toString(),
      },
    });
  }

  current.count++;
  rateLimitMap.set(key, current);

  // Cleanup old entries
  if (Math.random() < RATE_LIMIT.CLEANUP_CHANCE) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) rateLimitMap.delete(k);
    }
  }

  return null; // Continue to next middleware
}
