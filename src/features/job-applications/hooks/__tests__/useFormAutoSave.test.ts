import { renderHook } from "@testing-library/react";
import type { UseFormReturn } from "react-hook-form";

import type { JobApplicationInput } from "~/schemas/jobApplication.schema";

import { useFormAutoSave } from "../useFormAutoSave";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation();

describe("useFormAutoSave", () => {
  let mockForm: jest.Mocked<UseFormReturn<JobApplicationInput>>;
  let mockSubscription: { unsubscribe: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockSubscription = { unsubscribe: jest.fn() };

    mockForm = {
      reset: jest.fn(),
      watch: jest.fn().mockReturnValue(mockSubscription),
      formState: { dirtyFields: {} },
    } as unknown as jest.Mocked<UseFormReturn<JobApplicationInput>>;
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
  });

  describe("Draft Loading", () => {
    it("should load valid draft from localStorage on mount", () => {
      const mockDraft = {
        roleTitle: "Software Engineer",
        companyName: "Tech Corp",
        roleType: "Full-time",
        location: "Remote",
        dateApplied: "2024-01-01",
        advertLink: "https://example.com/job",
        status: "Applied",
        isLinkedInConnection: false,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockDraft));

      renderHook(() => useFormAutoSave(mockForm));

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "job-application-draft",
      );
      expect(mockForm.reset).toHaveBeenCalledWith(mockDraft);
    });

    it("should handle missing draft gracefully", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      renderHook(() => useFormAutoSave(mockForm));

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "job-application-draft",
      );
      expect(mockForm.reset).not.toHaveBeenCalled();
    });

    it("should handle corrupted draft data", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");

      renderHook(() => useFormAutoSave(mockForm));

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Failed to load saved draft:",
        expect.any(SyntaxError),
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "job-application-draft",
      );
      expect(mockForm.reset).not.toHaveBeenCalled();
    });

    it("should handle empty string draft", () => {
      mockLocalStorage.getItem.mockReturnValue("");

      renderHook(() => useFormAutoSave(mockForm));

      expect(mockForm.reset).not.toHaveBeenCalled();
    });
  });

  describe("Auto-save Behavior", () => {
    it("should set up form watcher on mount", () => {
      renderHook(() => useFormAutoSave(mockForm));

      expect(mockForm.watch).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should save form data when fields are dirty", () => {
      const mockData = { roleTitle: "Engineer", companyName: "Corp" };
      mockForm.formState.dirtyFields = { roleTitle: true };

      let watchCallback: (data: unknown) => void;
      mockForm.watch.mockImplementation((callback) => {
        watchCallback = callback as (data: unknown) => void;
        return mockSubscription;
      });

      renderHook(() => useFormAutoSave(mockForm));

      watchCallback!(mockData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "job-application-draft",
        JSON.stringify(mockData),
      );
    });

    it("should not save when no fields are dirty", () => {
      const mockData = { roleTitle: "Engineer" };
      mockForm.formState.dirtyFields = {};

      let watchCallback: (data: unknown) => void;
      mockForm.watch.mockImplementation((callback) => {
        watchCallback = callback as (data: unknown) => void;
        return mockSubscription;
      });

      renderHook(() => useFormAutoSave(mockForm));

      watchCallback!(mockData);

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it("should handle complex form data", () => {
      const complexData = {
        roleTitle: "Senior Software Engineer",
        companyName: "Tech Corp Ltd.",
        roleType: "Full-time",
        location: "London, UK",
        salary: "£80,000 - £100,000",
        dateApplied: "2024-01-15",
        advertLink: "https://jobs.example.com/senior-engineer?ref=123",
        cvUsed: "Senior_CV_2024.pdf",
        responseDate: "2024-01-20",
        status: "Interview Scheduled",
        contactName: "Jane Smith",
        contactEmail: "jane.smith@techcorp.com",
        contactPhone: "+44 20 1234 5678",
        isLinkedInConnection: true,
      };

      mockForm.formState.dirtyFields = { roleTitle: true, companyName: true };

      let watchCallback: (data: unknown) => void;
      mockForm.watch.mockImplementation((callback) => {
        watchCallback = callback as (data: unknown) => void;
        return mockSubscription;
      });

      renderHook(() => useFormAutoSave(mockForm));

      watchCallback!(complexData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "job-application-draft",
        JSON.stringify(complexData),
      );
    });
  });

  describe("Cleanup", () => {
    it("should unsubscribe from form watcher on unmount", () => {
      const { unmount } = renderHook(() => useFormAutoSave(mockForm));

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it("should provide clearDraft function", () => {
      const { result } = renderHook(() => useFormAutoSave(mockForm));

      expect(result.current.clearDraft).toBeInstanceOf(Function);
    });

    it("should clear draft from localStorage when clearDraft is called", () => {
      const { result } = renderHook(() => useFormAutoSave(mockForm));

      result.current.clearDraft();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "job-application-draft",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle localStorage errors gracefully", () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

      // The hook should not crash the component when localStorage fails
      const { result } = renderHook(() => useFormAutoSave(mockForm));

      expect(result.current.clearDraft).toBeInstanceOf(Function);
      expect(mockForm.reset).not.toHaveBeenCalled();
    });

    it("should handle form reset errors", () => {
      const mockDraft = { roleTitle: "Engineer" };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockDraft));
      mockForm.reset.mockImplementation(() => {
        throw new Error("Reset failed");
      });

      expect(() => {
        renderHook(() => useFormAutoSave(mockForm));
      }).not.toThrow();
    });

    it("should handle null form data in watcher", () => {
      mockForm.formState.dirtyFields = { roleTitle: true };

      let watchCallback: (data: unknown) => void;
      mockForm.watch.mockImplementation((callback) => {
        watchCallback = callback as (data: unknown) => void;
        return mockSubscription;
      });

      renderHook(() => useFormAutoSave(mockForm));

      watchCallback!(null);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "job-application-draft",
        "null",
      );
    });

    it("should handle localStorage.setItem errors during auto-save", () => {
      mockForm.formState.dirtyFields = { roleTitle: true };
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      let watchCallback: (data: unknown) => void;
      mockForm.watch.mockImplementation((callback) => {
        watchCallback = callback as (data: unknown) => void;
        return mockSubscription;
      });

      renderHook(() => useFormAutoSave(mockForm));

      watchCallback!({ roleTitle: "Engineer" });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Failed to save draft:",
        expect.any(Error),
      );
    });

    it("should handle localStorage.removeItem errors in clearDraft", () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error("Storage access denied");
      });

      const { result } = renderHook(() => useFormAutoSave(mockForm));

      result.current.clearDraft();

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Failed to clear draft:",
        expect.any(Error),
      );
    });
  });
});
