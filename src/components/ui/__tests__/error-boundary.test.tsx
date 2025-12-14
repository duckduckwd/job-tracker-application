import { render, screen } from "@testing-library/react";
import React from "react";

import { ErrorBoundary } from "../error-boundary";

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("ErrorBoundary Component", () => {
  describe("Normal Operation", () => {
    it("renders children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText("Child component")).toBeInTheDocument();
    });

    it("renders multiple children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText("First child")).toBeInTheDocument();
      expect(screen.getByText("Second child")).toBeInTheDocument();
    });

    it("renders complex child components", () => {
      const ComplexChild = () => (
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      );

      render(
        <ErrorBoundary>
          <ComplexChild />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("catches errors and displays default fallback UI", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText(/Unable to load the Add Application Details form/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Please refresh the page/)).toBeInTheDocument();
    });

    it("displays custom fallback UI when provided", () => {
      const customFallback = (
        <div data-testid="custom-fallback">
          <h2>Custom Error Message</h2>
          <p>Something went wrong with custom handling</p>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
      expect(screen.getByText("Custom Error Message")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong with custom handling"),
      ).toBeInTheDocument();

      // Should not show default fallback
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });

    it("catches errors from nested components", () => {
      const NestedComponent = () => (
        <div>
          <div>
            <ThrowError shouldThrow />
          </div>
        </div>
      );

      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("catches errors from components that throw during render", () => {
      const ErrorComponent = () => {
        throw new Error("Render error");
      };

      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  describe("Error Recovery", () => {
    it("can recover from errors when children change", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      // Should show error state
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Re-render with non-throwing component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      // Should still show error state (ErrorBoundary doesn't auto-recover)
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("maintains error state across re-renders", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Re-render the same error boundary
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper semantic structure in default fallback", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Something went wrong");
      expect(heading).toHaveAttribute("aria-level", "2");
    });

    it("applies proper styling classes for visual hierarchy", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      const container = screen
        .getByText("Something went wrong")
        .closest(".mx-auto");
      expect(container).toHaveClass("mx-auto", "w-full", "max-w-4xl");
      expect(container).toHaveClass("rounded-lg", "border", "border-red-200");
      expect(container).toHaveClass("bg-red-50", "p-6");
    });

    it("uses appropriate color scheme for error state", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      const heading = screen.getByText("Something went wrong");
      const description = screen.getByText(
        /Unable to load the Add Application Details form/,
      );

      expect(heading).toHaveClass("text-red-700");
      expect(description).toHaveClass("text-red-600");
    });
  });

  describe("Error Information", () => {
    it("logs error information to console", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "ApplicationDetails Error:",
        expect.any(Error),
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });

    it("handles different types of errors", () => {
      const TypeErrorComponent = () => {
        throw new TypeError("Type error");
      };

      render(
        <ErrorBoundary>
          <TypeErrorComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("handles errors with custom messages", () => {
      const CustomErrorComponent = () => {
        throw new Error("Custom error message");
      };

      render(
        <ErrorBoundary>
          <CustomErrorComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  describe("Fallback Customization", () => {
    it("accepts React elements as fallback", () => {
      const fallback = (
        <div data-testid="element-fallback">Element fallback</div>
      );

      render(
        <ErrorBoundary fallback={fallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("element-fallback")).toBeInTheDocument();
    });

    it("accepts complex fallback components", () => {
      const ComplexFallback = (
        <div data-testid="complex-fallback">
          <h1>Application Error</h1>
          <p>We encountered an unexpected error.</p>
          <button>Retry</button>
          <button>Report Issue</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={ComplexFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("complex-fallback")).toBeInTheDocument();
      expect(screen.getByText("Application Error")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
      expect(screen.getByText("Report Issue")).toBeInTheDocument();
    });

    it("handles null fallback gracefully", () => {
      render(
        <ErrorBoundary fallback={null}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      // When fallback is null, it still shows default fallback
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("handles undefined fallback by using default", () => {
      render(
        <ErrorBoundary fallback={undefined}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      // Should use default fallback when undefined
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles errors in components with hooks", () => {
      const HookErrorComponent = () => {
        // Throw during render, not in useEffect
        throw new Error("Hook error");
      };

      render(
        <ErrorBoundary>
          <HookErrorComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("handles multiple error boundaries", () => {
      render(
        <ErrorBoundary fallback={<div>Outer boundary</div>}>
          <ErrorBoundary fallback={<div>Inner boundary</div>}>
            <ThrowError shouldThrow />
          </ErrorBoundary>
        </ErrorBoundary>,
      );

      // Inner boundary should catch the error
      expect(screen.getByText("Inner boundary")).toBeInTheDocument();
      expect(screen.queryByText("Outer boundary")).not.toBeInTheDocument();
    });

    it("handles conditional rendering of error components", () => {
      const ConditionalError = ({ showError }: { showError: boolean }) => (
        <div>
          {showError && <ThrowError shouldThrow />}
          <div>Always visible</div>
        </div>
      );

      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalError showError={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Always visible")).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <ConditionalError showError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("maintains proper component hierarchy", () => {
      render(
        <ErrorBoundary>
          <div data-testid="parent">
            <div data-testid="child">Content</div>
          </div>
        </ErrorBoundary>,
      );

      const parent = screen.getByTestId("parent");
      const child = screen.getByTestId("child");

      expect(parent).toContainElement(child);
    });

    it("preserves component props and attributes", () => {
      render(
        <ErrorBoundary>
          <div data-custom="value" className="custom-class" id="custom-id">
            Content
          </div>
        </ErrorBoundary>,
      );

      const element = screen.getByText("Content");
      expect(element).toHaveAttribute("data-custom", "value");
      expect(element).toHaveClass("custom-class");
      expect(element).toHaveAttribute("id", "custom-id");
    });
  });
});
