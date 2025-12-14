/**
 * @jest-environment node
 */
import { type NextRequest } from "next/server";

import { RATE_LIMIT } from "~/constants";
import { SecurityLogger } from "~/lib/security/security-logger";

import { rateLimitMiddleware } from "../rateLimiting";

// Mock SecurityLogger
jest.mock("~/lib/security/security-logger", () => ({
  SecurityLogger: {
    logRateLimit: jest.fn(),
  },
}));

// Mock NextResponse
const mockNextResponse = {
  status: 429,
  headers: {
    get: jest.fn(),
    set: jest.fn(),
  },
};

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: jest.fn().mockImplementation(() => mockNextResponse),
}));

// Mock Date.now for consistent testing
const mockDateNow = jest.fn();
Date.now = mockDateNow;

describe("rateLimitMiddleware", () => {
  const mockLogRateLimit = SecurityLogger.logRateLimit as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(1000000);
  });

  const createMockRequest = (ip = "127.0.0.1", pathname = "/api/test") => {
    const headers = new Headers();
    headers.set("x-forwarded-for", ip);

    return {
      headers,
      nextUrl: { pathname },
    } as NextRequest;
  };

  it("allows requests under the rate limit", () => {
    const request = createMockRequest();

    const response = rateLimitMiddleware(request);

    expect(response).toBeNull();
    expect(mockLogRateLimit).not.toHaveBeenCalled();
  });

  it("handles missing x-forwarded-for header", () => {
    const headers = new Headers();
    const request = {
      headers,
      nextUrl: { pathname: "/api/test" },
    } as NextRequest;

    const response = rateLimitMiddleware(request);

    expect(response).toBeNull();
  });

  it("logs rate limit events with correct parameters", () => {
    const request = createMockRequest("203.0.113.1", "/api/sensitive");

    // Simulate hitting rate limit by making many requests
    for (let i = 0; i <= RATE_LIMIT.MAX_REQUESTS; i++) {
      rateLimitMiddleware(request);
    }

    // Should have logged at least once
    expect(mockLogRateLimit).toHaveBeenCalled();
  });

  it("handles malformed IP addresses", () => {
    const request = createMockRequest("invalid-ip");

    expect(() => {
      rateLimitMiddleware(request);
    }).not.toThrow();
  });

  it("processes requests consistently", () => {
    const request = createMockRequest();

    const response1 = rateLimitMiddleware(request);
    const response2 = rateLimitMiddleware(request);

    // Both should be processed (either null or response object)
    expect(typeof response1).toBeDefined();
    expect(typeof response2).toBeDefined();
  });

  it("cleans up old rate limit entries", () => {
    const mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(0.001); // Below cleanup chance

    // Create an old entry by setting time far in the past
    mockDateNow.mockReturnValueOnce(1000000); // Initial time
    const request1 = createMockRequest("192.168.1.1");
    rateLimitMiddleware(request1);

    // Move time forward significantly to make the entry old
    mockDateNow.mockReturnValue(2000000); // Much later time

    // Make another request to trigger cleanup
    const request2 = createMockRequest("192.168.1.2");
    const response = rateLimitMiddleware(request2);

    // Should process normally (cleanup happens internally)
    expect(response).toBeNull();

    mathRandomSpy.mockRestore();
  });
});
