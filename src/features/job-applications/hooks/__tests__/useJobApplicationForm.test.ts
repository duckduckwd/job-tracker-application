import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";

import type { JobApplicationInput } from "~/schemas/jobApplication.schema";

import * as useFormAutoSave from "../useFormAutoSave";
import * as useFormSubmission from "../useFormSubmission";
import { useJobApplicationForm } from "../useJobApplicationForm";

// Mock the dependencies
jest.mock("react-hook-form");
jest.mock("../useFormAutoSave");
jest.mock("../useFormSubmission");

const mockUseForm = jest.mocked(useForm);
const mockUseFormAutoSave = jest.mocked(useFormAutoSave.useFormAutoSave);
const mockUseFormSubmission = jest.mocked(useFormSubmission.useFormSubmission);

describe("useJobApplicationForm", () => {
  let mockForm: any;
  let mockClearDraft: jest.Mock;
  let mockSubmitForm: jest.Mock;
  let mockClearError: jest.Mock;

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

    mockForm = {
      reset: jest.fn(),
      formState: { errors: {} },
      handleSubmit: jest.fn(),
      watch: jest.fn(),
      setValue: jest.fn(),
      getValues: jest.fn(),
    };

    mockClearDraft = jest.fn();
    mockSubmitForm = jest.fn().mockResolvedValue(mockFormData);
    mockClearError = jest.fn();

    mockUseForm.mockReturnValue(mockForm);
    mockUseFormAutoSave.mockReturnValue({ clearDraft: mockClearDraft });
    mockUseFormSubmission.mockReturnValue({
      submitForm: mockSubmitForm,
      isSubmitting: false,
      submitError: null,
      clearError: mockClearError,
    });
  });

  describe("Initialization", () => {
    it("should initialize form with correct configuration", () => {
      renderHook(() => useJobApplicationForm());

      expect(mockUseForm).toHaveBeenCalledWith({
        resolver: expect.any(Function),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
          isLinkedInConnection: false,
        },
      });
    });

    it("should initialize auto-save with form instance", () => {
      renderHook(() => useJobApplicationForm());

      expect(mockUseFormAutoSave).toHaveBeenCalledWith(mockForm);
    });

    it("should initialize form submission hook", () => {
      renderHook(() => useJobApplicationForm());

      expect(mockUseFormSubmission).toHaveBeenCalled();
    });

    it("should return correct initial structure", () => {
      const { result } = renderHook(() => useJobApplicationForm());

      expect(result.current).toEqual({
        form: mockForm,
        onSubmit: expect.any(Function),
        isSubmitting: false,
        submitError: null,
        clearError: mockClearError,
      });
    });
  });

  describe("Form Submission", () => {
    it("should handle successful form submission", async () => {
      const { result } = renderHook(() => useJobApplicationForm());

      await act(async () => {
        await result.current.onSubmit(mockFormData);
      });

      expect(mockSubmitForm).toHaveBeenCalledWith(mockFormData);
      expect(mockClearDraft).toHaveBeenCalled();
      expect(mockForm.reset).toHaveBeenCalledWith({
        isLinkedInConnection: false,
      });
    });

    it("should handle form submission errors", async () => {
      const submissionError = new Error("Submission failed");
      mockSubmitForm.mockRejectedValue(submissionError);

      const { result } = renderHook(() => useJobApplicationForm());

      await expect(
        act(async () => {
          await result.current.onSubmit(mockFormData);
        }),
      ).rejects.toThrow("Submission failed");

      expect(mockSubmitForm).toHaveBeenCalledWith(mockFormData);
      // Should not clear draft or reset form on error
      expect(mockClearDraft).not.toHaveBeenCalled();
      expect(mockForm.reset).not.toHaveBeenCalled();
    });

    it("should handle complex form data submission", async () => {
      const complexData: JobApplicationInput = {
        roleTitle: "Senior Full-Stack Developer",
        companyName: "Innovation Labs Ltd.",
        roleType: "Contract",
        location: "London, UK",
        salary: "£600-800/day",
        dateApplied: "2024-01-15",
        advertLink: "https://careers.innovationlabs.com/senior-fullstack",
        cvUsed: "Senior_Developer_CV_2024.pdf",
        responseDate: "2024-01-20",
        status: "Interview Scheduled",
        contactName: "Sarah Johnson",
        contactEmail: "sarah.johnson@innovationlabs.com",
        contactPhone: "+44 20 7123 4567",
        isLinkedInConnection: true,
      };

      const { result } = renderHook(() => useJobApplicationForm());

      await act(async () => {
        await result.current.onSubmit(complexData);
      });

      expect(mockSubmitForm).toHaveBeenCalledWith(complexData);
      expect(mockClearDraft).toHaveBeenCalled();
      expect(mockForm.reset).toHaveBeenCalledWith({
        isLinkedInConnection: false,
      });
    });

    it("should maintain submission order", async () => {
      const { result } = renderHook(() => useJobApplicationForm());

      const callOrder: string[] = [];

      mockSubmitForm.mockImplementation(async () => {
        callOrder.push("submitForm");
        return mockFormData;
      });

      mockClearDraft.mockImplementation(() => {
        callOrder.push("clearDraft");
      });

      (mockForm.reset as jest.Mock).mockImplementation(() => {
        callOrder.push("formReset");
      });

      await act(async () => {
        await result.current.onSubmit(mockFormData);
      });

      expect(callOrder).toEqual(["submitForm", "clearDraft", "formReset"]);
    });
  });

  describe("State Management", () => {
    it("should reflect submission state from useFormSubmission", () => {
      mockUseFormSubmission.mockReturnValue({
        submitForm: mockSubmitForm,
        isSubmitting: true,
        submitError: "Test error",
        clearError: mockClearError,
      });

      const { result } = renderHook(() => useJobApplicationForm());

      expect(result.current.isSubmitting).toBe(true);
      expect(result.current.submitError).toBe("Test error");
    });

    it("should update state when submission state changes", () => {
      const { result, rerender } = renderHook(() => useJobApplicationForm());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);

      // Simulate state change
      mockUseFormSubmission.mockReturnValue({
        submitForm: mockSubmitForm,
        isSubmitting: true,
        submitError: "Network error",
        clearError: mockClearError,
      });

      rerender();

      expect(result.current.isSubmitting).toBe(true);
      expect(result.current.submitError).toBe("Network error");
    });

    it("should provide clearError function", () => {
      const { result } = renderHook(() => useJobApplicationForm());

      expect(result.current.clearError).toBe(mockClearError);

      act(() => {
        result.current.clearError();
      });

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe("Form Integration", () => {
    it("should pass form instance to auto-save hook", () => {
      renderHook(() => useJobApplicationForm());

      expect(mockUseFormAutoSave).toHaveBeenCalledWith(mockForm);
    });

    it("should maintain form reference stability", () => {
      const { result, rerender } = renderHook(() => useJobApplicationForm());

      const initialForm = result.current.form;

      rerender();

      expect(result.current.form).toBe(initialForm);
    });

    it("should handle form configuration changes", () => {
      renderHook(() => useJobApplicationForm());

      expect(mockUseForm).toHaveBeenCalledWith(
        expect.objectContaining({
          resolver: expect.any(Function),
          mode: "onBlur",
          reValidateMode: "onChange",
          defaultValues: { isLinkedInConnection: false },
        }),
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle auto-save initialization errors", () => {
      mockUseFormAutoSave.mockImplementation(() => {
        throw new Error("Auto-save failed");
      });

      expect(() => {
        renderHook(() => useJobApplicationForm());
      }).toThrow("Auto-save failed");
    });

    it("should handle form submission hook initialization errors", () => {
      mockUseFormSubmission.mockImplementation(() => {
        throw new Error("Submission hook failed");
      });

      expect(() => {
        renderHook(() => useJobApplicationForm());
      }).toThrow("Submission hook failed");
    });

    it("should handle form initialization errors", () => {
      mockUseForm.mockImplementation(() => {
        throw new Error("Form initialization failed");
      });

      expect(() => {
        renderHook(() => useJobApplicationForm());
      }).toThrow("Form initialization failed");
    });
  });

  describe("Function Stability", () => {
    it("should maintain stable onSubmit function reference", () => {
      const { result, rerender } = renderHook(() => useJobApplicationForm());

      const initialOnSubmit = result.current.onSubmit;

      rerender();

      expect(result.current.onSubmit).toBe(initialOnSubmit);
    });

    it("should maintain stable clearError function reference", () => {
      const { result, rerender } = renderHook(() => useJobApplicationForm());

      const initialClearError = result.current.clearError;

      rerender();

      expect(result.current.clearError).toBe(initialClearError);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null form data submission", async () => {
      const { result } = renderHook(() => useJobApplicationForm());

      await act(async () => {
        await result.current.onSubmit(null as unknown as JobApplicationInput);
      });

      expect(mockSubmitForm).toHaveBeenCalledWith(null);
    });

    it("should handle empty form data submission", async () => {
      const emptyData = {} as JobApplicationInput;
      const { result } = renderHook(() => useJobApplicationForm());

      await act(async () => {
        await result.current.onSubmit(emptyData);
      });

      expect(mockSubmitForm).toHaveBeenCalledWith(emptyData);
      expect(mockClearDraft).toHaveBeenCalled();
      expect(mockForm.reset).toHaveBeenCalledWith({
        isLinkedInConnection: false,
      });
    });

    it("should handle submission with partial data", async () => {
      const partialData = {
        roleTitle: "Engineer",
        companyName: "Corp",
      } as JobApplicationInput;

      const { result } = renderHook(() => useJobApplicationForm());

      await act(async () => {
        await result.current.onSubmit(partialData);
      });

      expect(mockSubmitForm).toHaveBeenCalledWith(partialData);
    });

    it("should handle multiple sequential submissions", async () => {
      const { result } = renderHook(() => useJobApplicationForm());

      // First submission
      await act(async () => {
        await result.current.onSubmit(mockFormData);
      });

      // Second submission
      await act(async () => {
        await result.current.onSubmit({
          ...mockFormData,
          roleTitle: "Different Role",
        });
      });

      expect(mockSubmitForm).toHaveBeenCalledTimes(2);
      expect(mockClearDraft).toHaveBeenCalledTimes(2);
      expect(mockForm.reset).toHaveBeenCalledTimes(2);
    });
  });
});
