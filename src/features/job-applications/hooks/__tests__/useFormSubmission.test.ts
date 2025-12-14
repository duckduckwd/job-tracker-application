import { act, renderHook } from "@testing-library/react";

import type { JobApplicationInput } from "~/schemas/jobApplication.schema";

import { useFormSubmission } from "../useFormSubmission";

// Mock the sanitisation utility
jest.mock("~/utils/sanitisation", () => ({
  sanitiseFormData: jest.fn(),
}));

import { sanitiseFormData } from "~/utils/sanitisation";

const mockSanitiseFormData = jest.mocked(sanitiseFormData);

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation();

describe("useFormSubmission", () => {
  const mockFormData: JobApplicationInput = {
    roleTitle: "Software Engineer",
    companyName: "Tech Corp",
    roleType: "Full-time",
    location: "Remote",
    dateApplied: "2024-01-01",
    advertLink: "https://example.com/job",
    status: "Applied",
    isLinkedInConnection: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSanitiseFormData.mockImplementation((data) => data);
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useFormSubmission());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);
      expect(result.current.submitForm).toBeInstanceOf(Function);
      expect(result.current.clearError).toBeInstanceOf(Function);
    });
  });

  describe("Form Submission", () => {
    it("should handle successful form submission", async () => {
      const sanitisedData = {
        ...mockFormData,
        roleTitle: "Sanitised Engineer",
      };
      mockSanitiseFormData.mockReturnValue(sanitisedData);

      const { result } = renderHook(() => useFormSubmission());

      const returnedData = await act(async () => {
        return await result.current.submitForm(mockFormData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);
      expect(returnedData).toEqual(sanitisedData);
      expect(mockSanitiseFormData).toHaveBeenCalledWith(mockFormData);
    });

    it("should handle sanitisation errors", async () => {
      const sanitisationError = new Error("Invalid data format");
      mockSanitiseFormData.mockImplementation(() => {
        throw sanitisationError;
      });

      const { result } = renderHook(() => useFormSubmission());

      let thrownError: unknown;

      await act(async () => {
        try {
          await result.current.submitForm(mockFormData);
        } catch (error) {
          thrownError = error;
        }
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe("Invalid data format");
      expect(thrownError).toBe(sanitisationError);
    });

    it("should handle generic errors", async () => {
      const genericError = "Something went wrong";
      mockSanitiseFormData.mockImplementation(() => {
        throw genericError;
      });

      const { result } = renderHook(() => useFormSubmission());

      let thrownError: unknown;

      await act(async () => {
        try {
          await result.current.submitForm(mockFormData);
        } catch (error) {
          thrownError = error;
        }
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe("An error occurred");
      expect(thrownError).toBe(genericError);
    });
  });

  describe("Error Management", () => {
    it("should clear errors when clearError is called", async () => {
      const { result } = renderHook(() => useFormSubmission());

      // Trigger an error first
      mockSanitiseFormData.mockImplementation(() => {
        throw new Error("Test error");
      });

      await act(async () => {
        try {
          await result.current.submitForm(mockFormData);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.submitError).toBe("Test error");

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.submitError).toBe(null);
    });

    it("should clear previous errors on new submission", async () => {
      const { result } = renderHook(() => useFormSubmission());

      // First submission with error
      mockSanitiseFormData.mockImplementationOnce(() => {
        throw new Error("First error");
      });

      await act(async () => {
        try {
          await result.current.submitForm(mockFormData);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.submitError).toBe("First error");

      // Second submission (successful)
      mockSanitiseFormData.mockImplementationOnce((data) => data);

      await act(async () => {
        await result.current.submitForm(mockFormData);
      });

      expect(result.current.submitError).toBe(null);
    });
  });

  describe("Function Stability", () => {
    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(() => useFormSubmission());

      const initialSubmitForm = result.current.submitForm;
      const initialClearError = result.current.clearError;

      rerender();

      expect(result.current.submitForm).toBe(initialSubmitForm);
      expect(result.current.clearError).toBe(initialClearError);
    });
  });
});
