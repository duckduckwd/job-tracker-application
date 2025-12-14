import { Logger } from "../../monitoring/logger";
import { SecurityLogger } from "../security-logger";

// Mock the Logger
jest.mock("../../monitoring/logger", () => ({
  Logger: {
    warn: jest.fn(),
  },
}));

describe("SecurityLogger", () => {
  const mockLoggerWarn = Logger.warn as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logRateLimit", () => {
    it("logs rate limit exceeded with correct parameters", () => {
      const ip = "192.168.1.1";
      const pathname = "/api/test";

      SecurityLogger.logRateLimit(ip, pathname);

      expect(mockLoggerWarn).toHaveBeenCalledWith("Rate limit exceeded", {
        ip: "192.168.1.1",
        pathname: "/api/test",
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ),
      });
    });

    it("handles different IP addresses", () => {
      const testCases = [
        { ip: "127.0.0.1", pathname: "/api/auth" },
        { ip: "10.0.0.1", pathname: "/api/analytics" },
        { ip: "::1", pathname: "/api/health" },
      ];

      for (const { ip, pathname } of testCases) {
        SecurityLogger.logRateLimit(ip, pathname);

        expect(mockLoggerWarn).toHaveBeenCalledWith("Rate limit exceeded", {
          ip,
          pathname,
          timestamp: expect.any(String),
        });
      }

      expect(mockLoggerWarn).toHaveBeenCalledTimes(3);
    });

    it("handles special characters in pathname", () => {
      const ip = "192.168.1.1";
      const pathname = "/api/test?param=value&other=123";

      SecurityLogger.logRateLimit(ip, pathname);

      expect(mockLoggerWarn).toHaveBeenCalledWith("Rate limit exceeded", {
        ip: "192.168.1.1",
        pathname: "/api/test?param=value&other=123",
        timestamp: expect.any(String),
      });
    });

    it("generates valid ISO timestamp", () => {
      const ip = "192.168.1.1";
      const pathname = "/api/test";

      SecurityLogger.logRateLimit(ip, pathname);

      const call = mockLoggerWarn.mock.calls[0][1];
      const timestamp = call.timestamp;

      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it("handles empty strings gracefully", () => {
      SecurityLogger.logRateLimit("", "");

      expect(mockLoggerWarn).toHaveBeenCalledWith("Rate limit exceeded", {
        ip: "",
        pathname: "",
        timestamp: expect.any(String),
      });
    });

    it("handles long IP addresses and pathnames", () => {
      const longIp = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      const longPathname =
        "/api/very/long/path/with/many/segments/and/parameters?param1=value1&param2=value2";

      SecurityLogger.logRateLimit(longIp, longPathname);

      expect(mockLoggerWarn).toHaveBeenCalledWith("Rate limit exceeded", {
        ip: longIp,
        pathname: longPathname,
        timestamp: expect.any(String),
      });
    });
  });
});
