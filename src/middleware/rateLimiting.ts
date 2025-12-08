import { type NextRequest, NextResponse } from "next/server";
import { SecurityLogger } from "~/lib/security/security-logger";

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // requests per window

  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const current = rateLimitMap.get(key) ?? {
    count: 0,
    resetTime: now + windowMs,
  };

  if (current.count >= maxRequests) {
    // Log the rate limit event
    SecurityLogger.logRateLimit(ip, request.nextUrl.pathname);

    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((current.resetTime - now) / 1000).toString(),
      },
    });
  }

  current.count++;
  rateLimitMap.set(key, current);

  // Cleanup old entries
  if (Math.random() < 0.01) {
    // 1% chance
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) rateLimitMap.delete(k);
    }
  }

  return null; // Continue to next middleware
}
