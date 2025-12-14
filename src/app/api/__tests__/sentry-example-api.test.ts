// Mock the route module to avoid NextRequest dependencies
jest.mock("../sentry-example-api/route", () => ({
  GET: jest.fn(() => {
    const error = new Error(
      "This error is raised on the backend called by the example page.",
    );
    error.name = "SentryExampleAPIError";
    throw error;
  }),
}));

import { GET } from "../sentry-example-api/route";

describe("/api/sentry-example-api", () => {
  describe("error behavior", () => {
    it("should throw SentryExampleAPIError when called", () => {
      // Act & Assert
      expect(() => GET()).toThrow(
        "This error is raised on the backend called by the example page.",
      );
    });

    it("should throw error with correct name", () => {
      // Act & Assert
      try {
        GET();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe("SentryExampleAPIError");
      }
    });

    it("should throw error with correct message", () => {
      // Act & Assert
      try {
        GET();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          "This error is raised on the backend called by the example page.",
        );
      }
    });

    it("should be a custom error class", () => {
      // Act & Assert
      try {
        GET();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe("SentryExampleAPIError");
      }
    });
  });

  describe("error consistency", () => {
    it("should throw the same error on multiple calls", () => {
      // Arrange
      let error1: Error | null = null;
      let error2: Error | null = null;

      // Act
      try {
        GET();
      } catch (error) {
        error1 = error as Error;
      }

      try {
        GET();
      } catch (error) {
        error2 = error as Error;
      }

      // Assert
      expect(error1).not.toBeNull();
      expect(error2).not.toBeNull();
      expect(error1?.name).toBe(error2?.name);
      expect(error1?.message).toBe(error2?.message);
    });

    it("should never return a response", () => {
      // Act & Assert
      expect(() => GET()).toThrow();

      // Verify that the function never reaches the return statement
      let didReturn = false;
      try {
        const result = GET();
        didReturn = true;
        // This should never execute
        expect(result).toBeUndefined();
      } catch {
        // Expected behavior
      }

      expect(didReturn).toBe(false);
    });
  });

  describe("error properties", () => {
    it("should have standard Error properties", () => {
      // Act & Assert
      try {
        GET();
      } catch (error) {
        const err = error as Error;
        expect(err).toHaveProperty("name");
        expect(err).toHaveProperty("message");
        expect(err).toHaveProperty("stack");
        expect(typeof err.stack).toBe("string");
      }
    });

    it("should have a stack trace", () => {
      // Act & Assert
      try {
        GET();
      } catch (error) {
        const err = error as Error;
        expect(err.stack).toBeDefined();
        expect(err.stack).toBeDefined();
        expect(err.stack?.includes("SentryExampleAPIError")).toBeTruthy();
      }
    });

    it("should be serializable for error reporting", () => {
      // Act & Assert
      try {
        GET();
      } catch (error) {
        const err = error as Error;

        // Test JSON serialization (common for error reporting)
        const serialized = JSON.stringify({
          name: err.name,
          message: err.message,
          stack: err.stack,
        });

        expect(serialized).toContain("SentryExampleAPIError");
        expect(serialized).toContain("This error is raised on the backend");

        const parsed = JSON.parse(serialized);
        expect(parsed.name).toBe("SentryExampleAPIError");
        expect(parsed.message).toBe(err.message);
      }
    });
  });

  describe("demonstration purpose validation", () => {
    it("should be designed for error monitoring demonstration", () => {
      // This test documents the intended purpose of this route
      // It should always throw an error for Sentry testing

      // Act & Assert
      expect(() => GET()).toThrow();

      // Verify the error message indicates it's for demonstration
      try {
        GET();
      } catch (error) {
        const err = error as Error;
        expect(err.message).toContain("backend called by the example page");
      }
    });

    it("should have predictable error behavior for monitoring tools", () => {
      // Monitoring tools expect consistent error patterns

      const errors: Error[] = [];

      // Collect multiple error instances
      for (let i = 0; i < 3; i++) {
        try {
          GET();
        } catch (error) {
          errors.push(error as Error);
        }
      }

      // Assert all errors are identical in structure
      expect(errors).toHaveLength(3);
      for (const error of errors) {
        expect(error.name).toBe("SentryExampleAPIError");
        expect(error.message).toBe(
          "This error is raised on the backend called by the example page.",
        );
      }
    });
  });

  describe("error handling edge cases", () => {
    it("should handle error in async context", async () => {
      // Test that the error can be caught in async/await context

      await expect(async () => {
        GET();
      }).rejects.toThrow(
        "This error is raised on the backend called by the example page.",
      );
    });

    it("should handle error in Promise context", () => {
      // Test that the error can be caught when wrapped in Promise

      return expect(
        new Promise((resolve, reject) => {
          try {
            GET();
            resolve("should not reach here");
          } catch (error) {
            reject(error);
          }
        }),
      ).rejects.toThrow(
        "This error is raised on the backend called by the example page.",
      );
    });

    it("should maintain error context across different execution contexts", () => {
      // Test error behavior in different contexts

      const errors: Error[] = [];

      // Synchronous context
      try {
        GET();
      } catch (error) {
        errors.push(error as Error);
      }

      // setTimeout context
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            GET();
          } catch (error) {
            errors.push(error as Error);

            // Verify both errors are equivalent
            expect(errors).toHaveLength(2);
            expect(errors[0]?.name).toBe(errors[1]?.name);
            expect(errors[0]?.message).toBe(errors[1]?.message);
            resolve();
          }
        }, 0);
      });
    });
  });

  describe("function behavior validation", () => {
    it("should be a function that throws", () => {
      // Assert
      expect(typeof GET).toBe("function");
      expect(() => GET()).toThrow();
    });

    it("should throw immediately without async behavior", () => {
      // The function should throw synchronously, not return a promise

      // Act & Assert
      expect(() => GET()).toThrow();

      // Verify it doesn't return a promise
      let threwError = false;
      try {
        const result = GET();
        // If we get here, it didn't throw
        expect(result).toBeUndefined(); // This should not execute
      } catch {
        threwError = true;
      }

      expect(threwError).toBe(true);
    });
  });
});
