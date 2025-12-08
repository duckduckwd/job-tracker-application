import { type NextRequest, NextResponse } from "next/server";
import { rateLimitMiddleware } from "./middleware/rateLimiting";

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Continue to next middleware or route
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
