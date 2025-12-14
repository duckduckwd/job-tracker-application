// Mock console.warn to capture analytics logs
const mockConsoleWarn = jest
  .spyOn(console, "warn")
  .mockImplementation(() => {});

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

import { NextResponse } from "next/server";

import type { AnalyticsEvent } from "~/types";

import { POST } from "../analytics/route";

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockJsonResponse = mockNextResponse.json;

describe("/api/analytics", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset NODE_ENV
    (process.env as any).NODE_ENV = originalEnv;
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
  });

  afterAll(() => {
    jest.restoreAllMocks();
    (process.env as any).NODE_ENV = originalEnv;
  });

  describe("successful event tracking", () => {
    it("should return success for valid analytics event", async () => {
      // Arrange
      const validEvent: AnalyticsEvent = {
        name: "page_view",
        properties: { page: "/dashboard" },
        userId: "user123",
      };

      const mockRequest = {
        json: jest.fn().mockResolvedValue(validEvent),
      } as any;

      const mockResponse = {
        json: () => Promise.resolve({ success: true }),
        status: 200,
      } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(mockRequest.json).toHaveBeenCalled();
    });

    it("should handle minimal analytics event", async () => {
      // Arrange
      const minimalEvent: AnalyticsEvent = { name: "button_click" };
      const mockRequest = {
        json: jest.fn().mockResolvedValue(minimalEvent),
      } as any;

      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await POST(mockRequest);

      // Assert
      expect(response.status).toBe(200);
      expect(mockNextResponse.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe("development environment logging", () => {
    it("should log analytics event in development environment", async () => {
      // Arrange
      (process.env as any).NODE_ENV = "development";
      const event: AnalyticsEvent = {
        name: "test_event",
        properties: { test: true },
      };
      const mockRequest = { json: jest.fn().mockResolvedValue(event) } as any;
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "📊 Analytics Event:",
        event,
      );
    });

    it("should not log analytics event in production environment", async () => {
      // Arrange
      (process.env as any).NODE_ENV = "production";
      const event: AnalyticsEvent = { name: "test_event" };
      const mockRequest = { json: jest.fn().mockResolvedValue(event) } as any;
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle malformed JSON gracefully", async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      } as any;

      const mockResponse = {
        json: () => Promise.resolve({ error: "Failed to track event" }),
        status: 500,
      } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to track event" });
    });

    it("should handle request parsing errors", async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
      } as any;

      const mockResponse = { status: 500 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await POST(mockRequest);

      // Assert
      expect(response.status).toBe(500);
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to track event" },
        { status: 500 },
      );
    });
  });

  describe("event processing", () => {
    it("should accept events with complex properties", async () => {
      // Arrange
      const complexEvent: AnalyticsEvent = {
        name: "form_submission",
        properties: {
          formId: "job-application",
          fields: ["name", "email"],
          metadata: { browser: "Chrome" },
        },
        userId: "user456",
      };

      const mockRequest = {
        json: jest.fn().mockResolvedValue(complexEvent),
      } as any;
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await POST(mockRequest);

      // Assert
      expect(response.status).toBe(200);
      expect(mockNextResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it("should handle events with special characters", async () => {
      // Arrange
      const specialEvent: AnalyticsEvent = {
        name: "special_chars_🚀",
        properties: { emoji: "🎉", unicode: "Hello 世界" },
      };

      const mockRequest = {
        json: jest.fn().mockResolvedValue(specialEvent),
      } as any;
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      const response = await POST(mockRequest);

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe("response structure", () => {
    it("should return consistent success response", async () => {
      // Arrange
      const event: AnalyticsEvent = { name: "test" };
      const mockRequest = { json: jest.fn().mockResolvedValue(event) } as any;
      const mockResponse = { status: 200 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it("should return consistent error response", async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error()),
      } as any;
      const mockResponse = { status: 500 } as any;
      mockJsonResponse.mockReturnValue(mockResponse);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to track event" },
        { status: 500 },
      );
    });
  });
});
