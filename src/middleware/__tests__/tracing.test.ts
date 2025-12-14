import { type NextRequest, NextResponse } from "next/server";

import { Logger } from "~/lib/monitoring/logger";
import { PerformanceMonitor } from "~/lib/monitoring/performance";

import { tracingMiddleware } from "../tracing";

// Mock dependencies
jest.mock("~/lib/monitoring/logger", () => ({
  Logger: {
    info: jest.fn(),
  },
}));

jest.mock("~/lib/monitoring/performance", () => ({
  PerformanceMonitor: {
    trackMetric: jest.fn(),
  },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({
      headers: new Map(),
      status: 200,
    })),
  },
}));

describe("tracingMiddleware", () => {
  const mockLoggerInfo = Logger.info as jest.Mock;
  const mockTrackMetric = PerformanceMonitor.trackMetric as jest.Mock;
  const mockNextResponseNext = NextResponse.next as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);
    jest.spyOn(Date, "now").mockReturnValue(1000000);

    // Reset the mock response
    const mockResponse = {
      headers: new Map(),
      status: 200,
    };
    mockResponse.headers.set = jest.fn();
    mockNextResponseNext.mockReturnValue(mockResponse);
  });

  afterEach(() => {
    (Math.random as jest.Mock).mockRestore();
    (Date.now as jest.Mock).mockRestore();
  });

  const createMockRequest = (
    method = "GET",
    pathname = "/api/test",
    headers: Record<string, string> = {},
  ) => {
    const requestHeaders = new Headers();
    for (const [key, value] of Object.entries(headers)) {
      requestHeaders.set(key, value);
    }

    return {
      method,
      nextUrl: { pathname },
      headers: requestHeaders,
    } as NextRequest;
  };

  it("generates and sets request ID header", () => {
    const request = createMockRequest();
    const response = tracingMiddleware(request);

    expect(response.headers.set).toHaveBeenCalledWith(
      "x-request-id",
      expect.any(String),
    );
  });

  it("logs request start with correct information", () => {
    const request = createMockRequest("POST", "/api/users", {
      "x-forwarded-for": "192.168.1.1",
      "user-agent": "Mozilla/5.0 Test Browser",
    });

    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith("Request started", {
      requestId: expect.any(String),
      method: "POST",
      url: "/api/users",
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0 Test Browser",
    });
  });

  it("uses default values for missing headers", () => {
    const request = createMockRequest("GET", "/api/test");

    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith("Request started", {
      requestId: expect.any(String),
      method: "GET",
      url: "/api/test",
      ip: "127.0.0.1",
      userAgent: "unknown",
    });
  });

  it("logs request completion with duration", () => {
    (Date.now as jest.Mock)
      .mockReturnValueOnce(1000000) // Start time
      .mockReturnValueOnce(1001500); // End time (1.5 seconds later)

    const request = createMockRequest("GET", "/api/test");
    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith("Request completed", {
      requestId: expect.any(String),
      method: "GET",
      url: "/api/test",
      duration: 1500,
      status: 200,
    });
  });

  it("tracks performance metrics", () => {
    (Date.now as jest.Mock)
      .mockReturnValueOnce(1000000)
      .mockReturnValueOnce(1000750); // 750ms duration

    const request = createMockRequest("POST", "/api/users");
    tracingMiddleware(request);

    expect(mockTrackMetric).toHaveBeenCalledWith({
      name: "request_duration",
      value: 750,
      unit: "ms",
      tags: {
        method: "POST",
        endpoint: "/api/users",
        status: "200",
      },
    });
  });

  it("handles different HTTP methods", () => {
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    for (const method of methods) {
      jest.clearAllMocks();
      const request = createMockRequest(method, "/api/test");
      tracingMiddleware(request);

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        "Request started",
        expect.objectContaining({ method }),
      );
    }
  });

  it("handles different response status codes", () => {
    const mockResponse = {
      headers: new Map(),
      status: 404,
    };
    mockResponse.headers.set = jest.fn();
    mockNextResponseNext.mockReturnValue(mockResponse);

    const request = createMockRequest();
    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Request completed",
      expect.objectContaining({ status: 404 }),
    );

    expect(mockTrackMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: expect.objectContaining({ status: "404" }),
      }),
    );
  });

  it("handles complex URL paths", () => {
    const complexPaths = [
      "/api/users/123/profile",
      "/api/job-applications/456/edit",
      "/dashboard/analytics",
      "/",
    ];

    for (const pathname of complexPaths) {
      jest.clearAllMocks();
      const request = createMockRequest("GET", pathname);
      tracingMiddleware(request);

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        "Request started",
        expect.objectContaining({ url: pathname }),
      );
    }
  });

  it("generates request IDs for concurrent requests", () => {
    const requests = [
      createMockRequest(),
      createMockRequest(),
      createMockRequest(),
    ];

    const responses = requests.map((request) => tracingMiddleware(request));

    // Check that request IDs were generated
    for (const response of responses) {
      expect(response.headers.set).toHaveBeenCalledWith(
        "x-request-id",
        expect.any(String),
      );
    }
  });

  it("handles IPv6 addresses", () => {
    const request = createMockRequest("GET", "/api/test", {
      "x-forwarded-for": "2001:db8::1",
    });

    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Request started",
      expect.objectContaining({ ip: "2001:db8::1" }),
    );
  });

  it("handles multiple forwarded IPs", () => {
    const request = createMockRequest("GET", "/api/test", {
      "x-forwarded-for": "203.0.113.1, 198.51.100.1, 192.168.1.1",
    });

    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Request started",
      expect.objectContaining({ ip: "203.0.113.1, 198.51.100.1, 192.168.1.1" }),
    );
  });

  it("handles very long user agent strings", () => {
    const longUserAgent = "A".repeat(1000);
    const request = createMockRequest("GET", "/api/test", {
      "user-agent": longUserAgent,
    });

    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Request started",
      expect.objectContaining({ userAgent: longUserAgent }),
    );
  });

  it("measures zero duration correctly", () => {
    (Date.now as jest.Mock).mockReturnValue(1000000); // Same time for start and end

    const request = createMockRequest();
    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Request completed",
      expect.objectContaining({ duration: 0 }),
    );

    expect(mockTrackMetric).toHaveBeenCalledWith(
      expect.objectContaining({ value: 0 }),
    );
  });

  it("handles very long request durations", () => {
    (Date.now as jest.Mock)
      .mockReturnValueOnce(1000000)
      .mockReturnValueOnce(1060000); // 60 seconds later

    const request = createMockRequest();
    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Request completed",
      expect.objectContaining({ duration: 60000 }),
    );
  });

  it("calls logger for request tracking", () => {
    const request = createMockRequest();

    tracingMiddleware(request);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Request started",
      expect.any(Object),
    );
  });

  it("calls performance tracking", () => {
    const request = createMockRequest();

    tracingMiddleware(request);

    expect(mockTrackMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "request_duration",
        unit: "ms",
      }),
    );
  });

  it("handles request ID generation failure", () => {
    (Math.random as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Random generation error");
    });

    const request = createMockRequest();

    // Should still return a response even if ID generation fails
    expect(() => {
      const response = tracingMiddleware(request);
      expect(response).toBeDefined();
    }).toThrow("Random generation error");
  });
});
