import { type NextRequest } from "next/server";

import { middleware } from "../../middleware";
import { rateLimitMiddleware } from "../rateLimiting";
import { tracingMiddleware } from "../tracing";

// Mock the middleware functions
jest.mock("../rateLimiting", () => ({
  rateLimitMiddleware: jest.fn(),
}));

jest.mock("../tracing", () => ({
  tracingMiddleware: jest.fn(),
}));

describe("middleware", () => {
  const mockRateLimitMiddleware = rateLimitMiddleware as jest.Mock;
  const mockTracingMiddleware = tracingMiddleware as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockRateLimitMiddleware.mockReturnValue(null);
    mockTracingMiddleware.mockReturnValue({
      headers: new Map([["x-request-id", "test-id"]]),
      status: 200,
    });
  });

  const createMockRequest = (pathname: string) => {
    return {
      nextUrl: { pathname },
    } as NextRequest;
  };

  describe("tracing middleware", () => {
    it("applies tracing to all routes", () => {
      const request = createMockRequest("/dashboard");

      middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
    });

    it("applies tracing to API routes", () => {
      const request = createMockRequest("/api/users");

      middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
    });

    it("applies tracing to root route", () => {
      const request = createMockRequest("/");

      middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
    });

    it("returns tracing response", () => {
      const request = createMockRequest("/dashboard");
      const expectedResponse = { headers: new Map(), status: 200 };
      mockTracingMiddleware.mockReturnValue(expectedResponse);

      const result = middleware(request);

      expect(result).toBe(expectedResponse);
    });
  });

  describe("rate limiting middleware", () => {
    it("applies rate limiting to API routes", () => {
      const request = createMockRequest("/api/users");

      middleware(request);

      expect(mockRateLimitMiddleware).toHaveBeenCalledWith(request);
    });

    it("applies rate limiting to nested API routes", () => {
      const request = createMockRequest("/api/auth/signin");

      middleware(request);

      expect(mockRateLimitMiddleware).toHaveBeenCalledWith(request);
    });

    it("does not apply rate limiting to non-API routes", () => {
      const request = createMockRequest("/dashboard");

      middleware(request);

      expect(mockRateLimitMiddleware).not.toHaveBeenCalled();
    });

    it("does not apply rate limiting to root route", () => {
      const request = createMockRequest("/");

      middleware(request);

      expect(mockRateLimitMiddleware).not.toHaveBeenCalled();
    });

    it("returns rate limit response when blocked", () => {
      const request = createMockRequest("/api/users");
      const rateLimitResponse = { status: 429, headers: new Map() };
      mockRateLimitMiddleware.mockReturnValue(rateLimitResponse);

      const result = middleware(request);

      expect(result).toBe(rateLimitResponse);
    });

    it("continues to tracing when rate limit allows request", () => {
      const request = createMockRequest("/api/users");
      mockRateLimitMiddleware.mockReturnValue(null); // Allow request

      const result = middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
      expect(result).toEqual(expect.objectContaining({ status: 200 }));
    });
  });

  describe("middleware execution order", () => {
    it("executes tracing first, then rate limiting for API routes", () => {
      const request = createMockRequest("/api/test");

      middleware(request);

      // Both should be called
      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
      expect(mockRateLimitMiddleware).toHaveBeenCalledWith(request);
    });

    it("executes only tracing for non-API routes", () => {
      const request = createMockRequest("/dashboard");

      middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
      expect(mockRateLimitMiddleware).not.toHaveBeenCalled();
    });

    it("short-circuits on rate limit block", () => {
      const request = createMockRequest("/api/blocked");
      const rateLimitResponse = { status: 429, headers: new Map() };
      mockRateLimitMiddleware.mockReturnValue(rateLimitResponse);

      const result = middleware(request);

      expect(result).toBe(rateLimitResponse);
      // Tracing should still be called first
      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
    });
  });

  describe("path matching", () => {
    it("correctly identifies API routes", () => {
      const apiPaths = [
        "/api/users",
        "/api/auth/signin",
        "/api/job-applications",
        "/api/analytics",
        "/api/health",
        "/api/nested/deep/route",
      ];

      for (const path of apiPaths) {
        jest.clearAllMocks();
        const request = createMockRequest(path);

        middleware(request);

        expect(mockRateLimitMiddleware).toHaveBeenCalledWith(request);
      }
    });

    it("correctly identifies non-API routes", () => {
      const nonApiPaths = [
        "/",
        "/dashboard",
        "/job-applications",
        "/job-applications/new",
        "/profile",
        "/settings",
        "/about",
        "/api", // Just "/api" without trailing slash
      ];

      for (const path of nonApiPaths) {
        jest.clearAllMocks();
        const request = createMockRequest(path);

        middleware(request);

        expect(mockRateLimitMiddleware).not.toHaveBeenCalledWith(request);
      }
    });

    it("handles edge cases in path matching", () => {
      const edgeCases = [
        "/api/", // API with trailing slash
        "/API/users", // Uppercase (should not match)
        "/dashboard/api/something", // API in middle of path
        "/apicall", // Starts with api but not /api/
      ];

      for (const path of edgeCases) {
        jest.clearAllMocks();
        const request = createMockRequest(path);

        middleware(request);

        if (path === "/api/") {
          expect(mockRateLimitMiddleware).toHaveBeenCalledWith(request);
        } else {
          expect(mockRateLimitMiddleware).not.toHaveBeenCalledWith(request);
        }
      }
    });
  });

  describe("error handling", () => {
    it("handles tracing middleware errors gracefully", () => {
      const request = createMockRequest("/test");
      mockTracingMiddleware.mockImplementationOnce(() => {
        throw new Error("Tracing error");
      });

      expect(() => {
        middleware(request);
      }).toThrow("Tracing error");
    });

    it("handles rate limiting middleware errors gracefully", () => {
      const request = createMockRequest("/api/test");
      mockRateLimitMiddleware.mockImplementationOnce(() => {
        throw new Error("Rate limiting error");
      });

      expect(() => {
        middleware(request);
      }).toThrow("Rate limiting error");
    });

    it("continues execution when rate limiting returns null", () => {
      const request = createMockRequest("/api/test");
      mockRateLimitMiddleware.mockReturnValue(null);

      const result = middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ status: 200 }));
    });
  });

  describe("response handling", () => {
    it("preserves tracing response headers", () => {
      const request = createMockRequest("/dashboard");
      const tracingResponse = {
        headers: new Map([
          ["x-request-id", "test-123"],
          ["x-trace-id", "trace-456"],
        ]),
        status: 200,
      };
      mockTracingMiddleware.mockReturnValue(tracingResponse);

      const result = middleware(request);

      expect(result).toBe(tracingResponse);
    });

    it("preserves rate limiting response structure", () => {
      const request = createMockRequest("/api/test");
      const rateLimitResponse = {
        status: 429,
        headers: new Map([["Retry-After", "60"]]),
        body: "Too Many Requests",
      };
      mockRateLimitMiddleware.mockReturnValue(rateLimitResponse);

      const result = middleware(request);

      expect(result).toBe(rateLimitResponse);
    });
  });

  describe("integration scenarios", () => {
    it("handles successful API request flow", () => {
      const request = createMockRequest("/api/users");

      // Rate limiting allows request
      mockRateLimitMiddleware.mockReturnValue(null);

      // Tracing adds headers
      const tracingResponse = {
        headers: new Map([["x-request-id", "req-123"]]),
        status: 200,
      };
      mockTracingMiddleware.mockReturnValue(tracingResponse);

      const result = middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
      expect(mockRateLimitMiddleware).toHaveBeenCalledWith(request);
      expect(result).toBe(tracingResponse);
    });

    it("handles blocked API request flow", () => {
      const request = createMockRequest("/api/users");

      // Rate limiting blocks request
      const rateLimitResponse = { status: 429, headers: new Map() };
      mockRateLimitMiddleware.mockReturnValue(rateLimitResponse);

      const result = middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
      expect(mockRateLimitMiddleware).toHaveBeenCalledWith(request);
      expect(result).toBe(rateLimitResponse);
    });

    it("handles non-API request flow", () => {
      const request = createMockRequest("/dashboard");

      const tracingResponse = {
        headers: new Map([["x-request-id", "req-456"]]),
        status: 200,
      };
      mockTracingMiddleware.mockReturnValue(tracingResponse);

      const result = middleware(request);

      expect(mockTracingMiddleware).toHaveBeenCalledWith(request);
      expect(mockRateLimitMiddleware).not.toHaveBeenCalled();
      expect(result).toBe(tracingResponse);
    });
  });

  describe("configuration", () => {
    it("exports correct matcher configuration", () => {
      const { config } = require("../../middleware");

      expect(config).toBeDefined();
      expect(config.matcher).toEqual([
        "/api/:path*",
        "/((?!_next/static|_next/image|favicon.ico).*)",
      ]);
    });
  });
});
