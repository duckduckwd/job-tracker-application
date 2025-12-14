import * as Sentry from "@sentry/nextjs";

import { Logger } from "../../monitoring/logger";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
}));

describe("Logger", () => {
  const mockAddBreadcrumb = Sentry.addBreadcrumb as jest.Mock;
  const mockCaptureMessage = Sentry.captureMessage as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
  });

  describe("log", () => {
    it("logs with all required fields", () => {
      const context = { userId: "user123", ip: "127.0.0.1" };

      Logger.log("info", "Test message", context);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: "app",
        message: "Test message",
        level: "info",
        data: expect.objectContaining({
          timestamp: expect.any(String),
          level: "info",
          message: "Test message",
          requestId: expect.any(String),
          userId: "user123",
          ip: "127.0.0.1",
        }),
      });
    });

    it("generates requestId when not provided", () => {
      Logger.log("info", "Test message");

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: "app",
        message: "Test message",
        level: "info",
        data: expect.objectContaining({
          requestId: expect.any(String),
        }),
      });
    });

    it("uses provided requestId", () => {
      const context = { requestId: "custom-request-id" };

      Logger.log("info", "Test message", context);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: "app",
        message: "Test message",
        level: "info",
        data: expect.objectContaining({
          requestId: "custom-request-id",
        }),
      });
    });

    it("captures errors to Sentry", () => {
      Logger.log("error", "Error message");

      expect(mockCaptureMessage).toHaveBeenCalledWith("Error message", "error");
    });

    it("does not capture non-errors to Sentry as messages", () => {
      Logger.log("info", "Info message");
      Logger.log("warn", "Warning message");
      Logger.log("debug", "Debug message");

      expect(mockCaptureMessage).not.toHaveBeenCalled();
    });

    it("logs to console in development", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "development",
      });

      Logger.log("info", "Test message");

      expect(console.log).toHaveBeenCalledWith(
        "\x1b[32m[INFO]\x1b[0m",
        expect.objectContaining({
          level: "info",
          message: "Test message",
        }),
      );
    });

    it("does not log to console in production", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production",
      });

      Logger.log("info", "Test message");

      expect(console.log).not.toHaveBeenCalled();
    });

    it("uses correct colors for different log levels", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "development",
      });

      Logger.log("debug", "Debug message");
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[36m[DEBUG]\x1b[0m",
        expect.any(Object),
      );

      Logger.log("info", "Info message");
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[32m[INFO]\x1b[0m",
        expect.any(Object),
      );

      Logger.log("warn", "Warning message");
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[33m[WARN]\x1b[0m",
        expect.any(Object),
      );

      Logger.log("error", "Error message");
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[31m[ERROR]\x1b[0m",
        expect.any(Object),
      );
    });
  });

  describe("convenience methods", () => {
    it("debug calls log with debug level", () => {
      const spy = jest.spyOn(Logger, "log");

      Logger.debug("Debug message", { test: true });

      expect(spy).toHaveBeenCalledWith("debug", "Debug message", {
        test: true,
      });
    });

    it("info calls log with info level", () => {
      const spy = jest.spyOn(Logger, "log");

      Logger.info("Info message", { test: true });

      expect(spy).toHaveBeenCalledWith("info", "Info message", { test: true });
    });

    it("warn calls log with warn level", () => {
      const spy = jest.spyOn(Logger, "log");

      Logger.warn("Warning message", { test: true });

      expect(spy).toHaveBeenCalledWith("warn", "Warning message", {
        test: true,
      });
    });

    it("error calls log with error level", () => {
      const spy = jest.spyOn(Logger, "log");

      Logger.error("Error message", { test: true });

      expect(spy).toHaveBeenCalledWith("error", "Error message", {
        test: true,
      });
    });

    it("convenience methods work without context", () => {
      const spy = jest.spyOn(Logger, "log");

      Logger.debug("Debug");
      Logger.info("Info");
      Logger.warn("Warning");
      Logger.error("Error");

      expect(spy).toHaveBeenCalledTimes(4);
      expect(spy).toHaveBeenNthCalledWith(1, "debug", "Debug", undefined);
      expect(spy).toHaveBeenNthCalledWith(2, "info", "Info", undefined);
      expect(spy).toHaveBeenNthCalledWith(3, "warn", "Warning", undefined);
      expect(spy).toHaveBeenNthCalledWith(4, "error", "Error", undefined);
    });
  });

  describe("generateRequestId", () => {
    it("generates unique request IDs", () => {
      const id1 = (Logger as any).generateRequestId();
      const id2 = (Logger as any).generateRequestId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("handles Sentry failures gracefully", () => {
      mockAddBreadcrumb.mockImplementationOnce(() => {
        throw new Error("Sentry error");
      });

      // Should not throw even if Sentry fails
      expect(() => {
        Logger.log("info", "Test message");
      }).not.toThrow();

      expect(mockAddBreadcrumb).toHaveBeenCalled();
    });

    it("logs Sentry failures to console in development", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "development",
      });
      const sentryError = new Error("Sentry connection failed");

      mockAddBreadcrumb.mockImplementationOnce(() => {
        throw sentryError;
      });

      Logger.log("info", "Test message");

      expect(console.warn).toHaveBeenCalledWith(
        "Sentry logging failed:",
        sentryError,
      );
    });

    it("does not log Sentry failures to console in production", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production",
      });
      const sentryError = new Error("Sentry connection failed");

      mockAddBreadcrumb.mockImplementationOnce(() => {
        throw sentryError;
      });

      Logger.log("info", "Test message");

      expect(console.warn).not.toHaveBeenCalled();
    });

    it("handles complex context objects", () => {
      const complexContext = {
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
        circular: {} as any,
        function: () => {},
        undefined,
        null: null,
      };
      complexContext.circular.self = complexContext.circular;

      expect(() => {
        Logger.log("info", "Complex context", complexContext);
      }).not.toThrow();
    });

    it("handles very long messages", () => {
      const longMessage = "A".repeat(10000);

      expect(() => {
        Logger.log("info", longMessage);
      }).not.toThrow();
    });

    it("handles special characters in messages", () => {
      const specialMessage = "Message with 🚀 emojis and \n newlines \t tabs";

      expect(() => {
        Logger.log("info", specialMessage);
      }).not.toThrow();

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: specialMessage,
        }),
      );
    });
  });

  describe("timestamp format", () => {
    it("generates valid ISO timestamps", () => {
      Logger.log("info", "Test message");

      const call = mockAddBreadcrumb.mock.calls[0][0];
      const timestamp = call.data.timestamp;

      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });
});
