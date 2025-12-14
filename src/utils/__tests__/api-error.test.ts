import { ZodError } from "zod";

import { Prisma } from "../../../generated/prisma";
import { handleApiError } from "../api-error";

// Mock NextResponse since it requires web environment
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: jest.fn().mockResolvedValue(body),
      status: init?.status || 200,
      headers: new Map(),
    })),
  },
}));

// Mock console.error to avoid noise in test output
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Clean up mocks after tests
afterAll(() => {
  jest.restoreAllMocks();
});

describe("handleApiError", () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  describe("ZodError handling", () => {
    it("should handle ZodError with validation details", async () => {
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["name"],
          message: "Expected string, received number",
        },
        {
          code: "too_small",
          minimum: 1,
          type: "string",
          inclusive: true,
          path: ["email"],
          message: "String must contain at least 1 character(s)",
        },
      ]);

      const response = handleApiError(zodError);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Validation failed",
        details: expect.arrayContaining([
          expect.objectContaining({
            code: "invalid_type",
            path: ["name"],
            message: "Expected string, received number",
          }),
          expect.objectContaining({
            code: "too_small",
            path: ["email"],
            message: "String must contain at least 1 character(s)",
          }),
        ]),
      });
    });

    it("should handle empty ZodError", async () => {
      const zodError = new ZodError([]);

      const response = handleApiError(zodError);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Validation failed",
        details: [],
      });
    });
  });

  describe("Prisma error handling", () => {
    it("should handle P2002 unique constraint violation", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        {
          code: "P2002",
          clientVersion: "5.0.0",
          meta: { target: ["email"] },
        },
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({
        error: "Resource already exists",
        code: "P2002",
      });
    });

    it("should handle P2025 record not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        {
          code: "P2025",
          clientVersion: "5.0.0",
          meta: { cause: "Record to delete does not exist." },
        },
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Resource not found",
        code: "P2025",
      });
    });

    it("should handle P2003 foreign key constraint violation", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        {
          code: "P2003",
          clientVersion: "5.0.0",
          meta: { field_name: "userId" },
        },
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Invalid reference",
        code: "P2003",
      });
    });

    it("should handle unknown Prisma error codes", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unknown error",
        {
          code: "P9999",
          clientVersion: "5.0.0",
        },
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
      expect(mockConsoleError).toHaveBeenCalledWith("API Error:", prismaError);
    });

    it("should handle PrismaClientValidationError", async () => {
      const validationError = new Prisma.PrismaClientValidationError(
        "Invalid data provided",
        { clientVersion: "5.0.0" },
      );

      const response = handleApiError(validationError);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Invalid data format",
      });
    });
  });

  describe("Generic error handling", () => {
    it("should handle standard Error objects", async () => {
      const standardError = new Error("Something went wrong");

      const response = handleApiError(standardError);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
      expect(mockConsoleError).toHaveBeenCalledWith(
        "API Error:",
        standardError,
      );
    });

    it("should handle string errors", async () => {
      const stringError = "String error message";

      const response = handleApiError(stringError);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
      expect(mockConsoleError).toHaveBeenCalledWith("API Error:", stringError);
    });

    it("should handle null errors", async () => {
      const response = handleApiError(null);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
      expect(mockConsoleError).toHaveBeenCalledWith("API Error:", null);
    });

    it("should handle undefined errors", async () => {
      const response = handleApiError(undefined);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
      expect(mockConsoleError).toHaveBeenCalledWith("API Error:", undefined);
    });

    it("should handle object errors without instanceof matches", async () => {
      const customError = {
        message: "Custom error object",
        code: "CUSTOM_ERROR",
      };

      const response = handleApiError(customError);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
      expect(mockConsoleError).toHaveBeenCalledWith("API Error:", customError);
    });
  });

  describe("Response format consistency", () => {
    it("should always return response objects with correct structure", () => {
      const zodError = new ZodError([]);
      const prismaError = new Prisma.PrismaClientValidationError("test", {
        clientVersion: "5.0.0",
      });
      const genericError = new Error("test");

      const zodResponse = handleApiError(zodError);
      const prismaResponse = handleApiError(prismaError);
      const genericResponse = handleApiError(genericError);

      expect(zodResponse).toHaveProperty("json");
      expect(zodResponse).toHaveProperty("status");
      expect(prismaResponse).toHaveProperty("json");
      expect(prismaResponse).toHaveProperty("status");
      expect(genericResponse).toHaveProperty("json");
      expect(genericResponse).toHaveProperty("status");
    });

    it("should always include error property in response body", async () => {
      const errors = [
        new ZodError([]),
        new Prisma.PrismaClientValidationError("test", {
          clientVersion: "5.0.0",
        }),
        new Error("test"),
        "string error",
        null,
      ];

      for (const error of errors) {
        const response = handleApiError(error);
        const data = await response.json();

        expect(data).toHaveProperty("error");
        expect(typeof data.error).toBe("string");
      }
    });

    it("should use appropriate HTTP status codes", async () => {
      const testCases = [
        { error: new ZodError([]), expectedStatus: 400 },
        {
          error: new Prisma.PrismaClientKnownRequestError("test", {
            code: "P2002",
            clientVersion: "5.0.0",
          }),
          expectedStatus: 409,
        },
        {
          error: new Prisma.PrismaClientKnownRequestError("test", {
            code: "P2025",
            clientVersion: "5.0.0",
          }),
          expectedStatus: 404,
        },
        {
          error: new Prisma.PrismaClientValidationError("test", {
            clientVersion: "5.0.0",
          }),
          expectedStatus: 400,
        },
        { error: new Error("test"), expectedStatus: 500 },
        { error: "string error", expectedStatus: 500 },
      ];

      for (const { error, expectedStatus } of testCases) {
        const response = handleApiError(error);
        expect(response.status).toBe(expectedStatus);
      }
    });
  });

  describe("Edge cases and error boundaries", () => {
    it("should handle errors with circular references", async () => {
      const circularError: any = { message: "Circular error" };
      circularError.self = circularError;

      const response = handleApiError(circularError);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
      expect(mockConsoleError).toHaveBeenCalledWith(
        "API Error:",
        circularError,
      );
    });

    it("should handle very large error objects", async () => {
      const largeError = {
        message: "Large error",
        data: "x".repeat(10000),
        nested: {
          moreData: "y".repeat(5000),
        },
      };

      const response = handleApiError(largeError);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
    });

    it("should handle errors that throw during property access", async () => {
      const problematicError = Object.create(null);
      Object.defineProperty(problematicError, "message", {
        get() {
          throw new Error("Property access error");
        },
        enumerable: true,
      });

      // Should not throw during error handling
      expect(() => handleApiError(problematicError)).not.toThrow();

      const response = handleApiError(problematicError);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Internal server error",
      });
    });
  });
});
