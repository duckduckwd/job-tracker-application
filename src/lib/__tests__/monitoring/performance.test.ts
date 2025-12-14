import * as Sentry from "@sentry/nextjs";

import { PERFORMANCE } from "~/constants";

import { Logger } from "../../monitoring/logger";
import { PerformanceMonitor } from "../../monitoring/performance";

// Mock dependencies
jest.mock("@sentry/nextjs", () => ({
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

jest.mock("../../monitoring/logger", () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock performance.now()
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, "performance", {
  value: { now: mockPerformanceNow },
  writable: true,
});

describe("PerformanceMonitor", () => {
  const originalEnv = process.env.NODE_ENV;
  const mockCaptureMessage = Sentry.captureMessage as jest.Mock;
  const mockAddBreadcrumb = Sentry.addBreadcrumb as jest.Mock;
  const mockLoggerInfo = Logger.info as jest.Mock;
  const mockLoggerWarn = Logger.warn as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
    jest.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    (Math.random as jest.Mock).mockRestore();
  });

  describe("startTimer and endTimer", () => {
    it("measures operation duration correctly", () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1500);

      const timerId = PerformanceMonitor.startTimer("test");
      const duration = PerformanceMonitor.endTimer(timerId);

      expect(duration).toBe(500);
      expect(mockLoggerInfo).toHaveBeenCalledWith("Performance: test", {
        duration: 500,
        operation: "test",
      });
    });

    it("generates unique timer IDs", () => {
      const timerId1 = PerformanceMonitor.startTimer("operation1");
      const timerId2 = PerformanceMonitor.startTimer("operation2");

      expect(timerId1).not.toBe(timerId2);
      expect(timerId1).toContain("operation1");
      expect(timerId2).toContain("operation2");
    });

    it("handles missing timer gracefully", () => {
      const duration = PerformanceMonitor.endTimer("non-existent-timer");

      expect(duration).toBe(0);
      expect(mockLoggerWarn).toHaveBeenCalledWith("Timer not found", {
        timerId: "non-existent-timer",
      });
    });

    it("includes additional context in logs", () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1200);

      const timerId = PerformanceMonitor.startTimer("api");
      const context = { endpoint: "/api/users", method: "GET" };
      PerformanceMonitor.endTimer(timerId, context);

      expect(mockLoggerInfo).toHaveBeenCalledWith("Performance: api", {
        duration: 200,
        operation: "api",
        endpoint: "/api/users",
        method: "GET",
      });
    });

    it("cleans up timer after use", () => {
      const timerId = PerformanceMonitor.startTimer("cleanup");
      PerformanceMonitor.endTimer(timerId);

      // Try to end the same timer again
      const duration = PerformanceMonitor.endTimer(timerId);
      expect(duration).toBe(0);
      expect(mockLoggerWarn).toHaveBeenCalledWith("Timer not found", {
        timerId,
      });
    });
  });

  describe("threshold monitoring", () => {
    it("warns about slow operations using default threshold", () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(2100); // 1100ms

      const timerId = PerformanceMonitor.startTimer("slow");
      PerformanceMonitor.endTimer(timerId);

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "Slow operation detected: slow",
        {
          duration: 1100,
          threshold: PERFORMANCE.THRESHOLDS.DEFAULT,
        },
      );
    });

    it("does not warn for fast operations", () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1200); // 200ms

      const timerId = PerformanceMonitor.startTimer("fast");
      PerformanceMonitor.endTimer(timerId);

      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });
  });

  describe("Sentry integration", () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = "production";
    });

    it("captures slow operations to Sentry", () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(2100); // 1100ms

      const timerId = PerformanceMonitor.startTimer("slow");
      PerformanceMonitor.endTimer(timerId);

      expect(mockCaptureMessage).toHaveBeenCalledWith(
        "Slow operation: slow (1100ms)",
        "warning",
      );
    });

    it("samples normal operations for breadcrumbs", () => {
      (Math.random as jest.Mock).mockReturnValue(0.01); // Below sample rate
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1200); // 200ms

      const timerId = PerformanceMonitor.startTimer("normal");
      PerformanceMonitor.endTimer(timerId);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: "performance",
        message: "normal completed",
        level: "info",
        data: {
          duration: 200,
          operation: "normal",
        },
      });
    });

    it("does not sample when above sample rate", () => {
      (Math.random as jest.Mock).mockReturnValue(0.9); // Above sample rate
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1200);

      const timerId = PerformanceMonitor.startTimer("normal");
      PerformanceMonitor.endTimer(timerId);

      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    });

    it("does not send to Sentry in development", () => {
      (process.env as any).NODE_ENV = "development";
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(2100);

      const timerId = PerformanceMonitor.startTimer("slow");
      PerformanceMonitor.endTimer(timerId);

      expect(mockCaptureMessage).not.toHaveBeenCalled();
      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe("trackMetric", () => {
    it("logs metrics correctly", () => {
      const metric = {
        name: "response_time",
        value: 250,
        unit: "ms" as const,
        tags: { endpoint: "/api/users" },
      };

      PerformanceMonitor.trackMetric(metric);

      expect(mockLoggerInfo).toHaveBeenCalledWith("Metric: response_time", {
        value: 250,
        unit: "ms",
        endpoint: "/api/users",
      });
    });

    it("handles metrics without tags", () => {
      const metric = {
        name: "memory_usage",
        value: 1024,
        unit: "bytes" as const,
      };

      PerformanceMonitor.trackMetric(metric);

      expect(mockLoggerInfo).toHaveBeenCalledWith("Metric: memory_usage", {
        value: 1024,
        unit: "bytes",
      });
    });

    it("samples metrics to Sentry in production", () => {
      (process.env as any).NODE_ENV = "production";
      (Math.random as jest.Mock).mockReturnValue(0.05); // Below sample rate

      const metric = {
        name: "request_count",
        value: 100,
        unit: "count" as const,
      };

      PerformanceMonitor.trackMetric(metric);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: "metric",
        message: "request_count: 100count",
        level: "info",
        data: metric,
      });
    });

    it("does not track zero-value metrics to Sentry", () => {
      (process.env as any).NODE_ENV = "production";

      const metric = {
        name: "zero_metric",
        value: 0,
        unit: "count" as const,
      };

      PerformanceMonitor.trackMetric(metric);

      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    });

    it("does not sample metrics when above sample rate", () => {
      (process.env as any).NODE_ENV = "production";
      (Math.random as jest.Mock).mockReturnValue(0.9); // Above sample rate

      const metric = {
        name: "high_value_metric",
        value: 100,
        unit: "count" as const,
      };

      PerformanceMonitor.trackMetric(metric);

      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe("timeAsync", () => {
    it("times successful async operations", async () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1300);

      const asyncOperation = jest.fn().mockResolvedValue("success");
      const result = await PerformanceMonitor.timeAsync(
        "async",
        asyncOperation,
      );

      expect(result).toBe("success");
      expect(mockLoggerInfo).toHaveBeenCalledWith("Performance: async", {
        duration: 300,
        operation: "async",
        success: true,
      });
    });

    it("times failed async operations", async () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1400);

      const error = new Error("Operation failed");
      const asyncOperation = jest.fn().mockRejectedValue(error);

      await expect(
        PerformanceMonitor.timeAsync("failing", asyncOperation),
      ).rejects.toThrow("Operation failed");

      expect(mockLoggerInfo).toHaveBeenCalledWith("Performance: failing", {
        duration: 400,
        operation: "failing",
        success: false,
        error: "Error: Operation failed",
      });
    });

    it("includes additional context", async () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1200);

      const asyncOperation = jest.fn().mockResolvedValue("result");
      const context = { userId: "123", endpoint: "/api/test" };

      await PerformanceMonitor.timeAsync("contextual", asyncOperation, context);

      expect(mockLoggerInfo).toHaveBeenCalledWith("Performance: contextual", {
        duration: 200,
        operation: "contextual",
        success: true,
        userId: "123",
        endpoint: "/api/test",
      });
    });

    it("handles promise rejections correctly", async () => {
      const asyncOperation = jest.fn().mockRejectedValue("String error");

      await expect(
        PerformanceMonitor.timeAsync("stringerror", asyncOperation),
      ).rejects.toBe("String error");

      expect(mockLoggerInfo).toHaveBeenCalledWith("Performance: stringerror", {
        duration: expect.any(Number),
        operation: "stringerror",
        success: false,
        error: "String error",
      });
    });
  });

  describe("error handling", () => {
    it("handles performance.now() failures", () => {
      mockPerformanceNow.mockImplementationOnce(() => {
        throw new Error("Performance API error");
      });

      expect(() => {
        PerformanceMonitor.startTimer("test");
      }).toThrow("Performance API error");
    });
  });
});
