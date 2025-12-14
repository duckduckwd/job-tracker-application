// Mock dependencies
jest.mock("~/lib/monitoring/logger", () => ({
  Logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("~/lib/monitoring/performance", () => ({
  PerformanceMonitor: {
    timeAsync: jest.fn(),
  },
}));

jest.mock("~/server/db", () => ({
  db: {
    $queryRaw: jest.fn(),
  },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

import { NextResponse } from "next/server";

import { Logger } from "~/lib/monitoring/logger";
import { PerformanceMonitor } from "~/lib/monitoring/performance";
import { db } from "~/server/db";

import { GET } from "../health/route";

const mockLogger = Logger as jest.Mocked<typeof Logger>;
const mockPerformanceMonitor = PerformanceMonitor as jest.Mocked<
  typeof PerformanceMonitor
>;
const mockDb = db as jest.Mocked<typeof db>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockJsonResponse = mockNextResponse.json;

describe("/api/health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.DATABASE_URL;
    delete process.env.npm_package_version;
  });

  describe("successful health checks", () => {
    it("should return healthy status when all checks pass", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      process.env.npm_package_version = "1.2.3";

      mockPerformanceMonitor.timeAsync.mockResolvedValue({ status: "healthy" });
      mockDb.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
      const mockResponse = {
        json: () =>
          Promise.resolve({
            status: "healthy",
            timestamp: "2023-01-01T00:00:00.000Z",
            uptime: 100,
            responseTime: 50,
            checks: {
              database: { status: "healthy" },
              environment: {
                status: "healthy",
                message: "All required env vars present",
              },
            },
            version: "1.2.3",
          }),
        status: 200,
        headers: new Headers([
          ["Cache-Control", "no-cache, no-store, must-revalidate"],
        ]),
      } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        status: "healthy",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        responseTime: expect.any(Number),
        checks: {
          database: { status: "healthy" },
          environment: {
            status: "healthy",
            message: "All required env vars present",
          },
        },
        version: "1.2.3",
      });
    });

    it("should call performance monitoring for database check", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      mockPerformanceMonitor.timeAsync.mockResolvedValue({ status: "healthy" });
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await GET();

      // Assert
      expect(mockPerformanceMonitor.timeAsync).toHaveBeenCalledWith(
        "health-check-db",
        expect.any(Function),
      );
    });

    it("should log debug information on successful health check", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      mockPerformanceMonitor.timeAsync.mockResolvedValue({ status: "healthy" });
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await GET();

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Health check completed",
        expect.objectContaining({
          status: "healthy",
          responseTime: expect.any(Number),
        }),
      );
    });
  });

  describe("unhealthy conditions", () => {
    it("should return unhealthy status when DATABASE_URL is missing", async () => {
      // Arrange - DATABASE_URL not set
      mockPerformanceMonitor.timeAsync.mockResolvedValue({ status: "healthy" });
      const mockResponse = { status: 503 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(503);
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "unhealthy",
          checks: expect.objectContaining({
            environment: expect.objectContaining({
              status: "unhealthy",
              message: "Missing DATABASE_URL",
            }),
          }),
        }),
        expect.objectContaining({ status: 503 }),
      );
    });

    it("should return unhealthy status when database check fails", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      mockPerformanceMonitor.timeAsync.mockResolvedValue({
        status: "unhealthy",
      });
      const mockResponse = { status: 503 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(503);
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "unhealthy",
          checks: expect.objectContaining({
            database: { status: "unhealthy" },
          }),
        }),
        expect.objectContaining({ status: 503 }),
      );
    });
  });

  describe("error handling", () => {
    it("should handle database connection errors gracefully", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      const dbError = new Error("Connection failed");
      mockPerformanceMonitor.timeAsync.mockRejectedValue(dbError);
      const mockResponse = { status: 503 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(503);
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "unhealthy",
          error: "Health check failed",
        }),
        expect.objectContaining({ status: 503 }),
      );
    });

    it("should log error details when health check fails", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      const dbError = new Error("Database timeout");
      mockPerformanceMonitor.timeAsync.mockRejectedValue(dbError);
      const mockResponse = { status: 503 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await GET();

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Health check failed",
        expect.objectContaining({
          error: "Database timeout",
          responseTime: expect.any(Number),
        }),
      );
    });

    it("should handle non-Error exceptions", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      mockPerformanceMonitor.timeAsync.mockRejectedValue("String error");
      const mockResponse = { status: 503 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await GET();

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Health check failed",
        expect.objectContaining({
          error: "String error",
        }),
      );
    });
  });

  describe("database connectivity", () => {
    it("should execute database query through performance monitor", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      let capturedFunction: (() => Promise<any>) | null = null;

      mockPerformanceMonitor.timeAsync.mockImplementation(async (label, fn) => {
        capturedFunction = fn;
        return { status: "healthy" };
      });
      mockDb.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await GET();

      // Assert
      expect(mockPerformanceMonitor.timeAsync).toHaveBeenCalledWith(
        "health-check-db",
        expect.any(Function),
      );

      // Verify the function calls the database
      if (capturedFunction) {
        await (capturedFunction as () => Promise<any>)();
        expect(mockDb.$queryRaw).toHaveBeenCalledWith(
          expect.arrayContaining(["SELECT 1"]),
        );
      }
    });
  });

  describe("environment validation", () => {
    it("should check for required environment variables", async () => {
      // Arrange
      process.env.DATABASE_URL = "postgresql://test";
      mockPerformanceMonitor.timeAsync.mockResolvedValue({ status: "healthy" });
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await GET();

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            environment: expect.objectContaining({
              status: "healthy",
              message: "All required env vars present",
            }),
          }),
        }),
        expect.any(Object),
      );
    });
  });
});
