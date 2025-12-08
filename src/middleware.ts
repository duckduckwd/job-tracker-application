import { type NextRequest } from "next/server";
import { rateLimitMiddleware } from "./middleware/rateLimiting";
import { tracingMiddleware } from "./middleware/tracing";

export function middleware(request: NextRequest) {
  // Apply request tracing to all routes first
  const tracingResponse = tracingMiddleware(request);

  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Return the tracing response (which includes request ID header)
  return tracingResponse;
}

export const config = {
  matcher: [
    "/api/:path*", // API routes for rate limiting
    "/((?!_next/static|_next/image|favicon.ico).*)", // All other routes for tracing
  ],
};
