import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ErrorAlert } from "../error-alert";

describe("ErrorAlert Component", () => {
  const defaultProps = {
    error: "Something went wrong",
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering and Content", () => {
    it("displays the error message", () => {
      render(<ErrorAlert {...defaultProps} />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("displays long error messages", () => {
      const longError =
        "This is a very long error message that should still be displayed properly and maintain good readability for users";
      render(
        <ErrorAlert error={longError} onDismiss={defaultProps.onDismiss} />,
      );

      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it("displays error messages with special characters", () => {
      const specialError =
        "Error: Failed to connect to API (status: 500) - Please try again!";
      render(
        <ErrorAlert error={specialError} onDismiss={defaultProps.onDismiss} />,
      );

      expect(screen.getByText(specialError)).toBeInTheDocument();
    });

    it("renders dismiss button with correct text", () => {
      render(<ErrorAlert {...defaultProps} />);

      expect(screen.getByText("Dismiss")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /dismiss/i }),
      ).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls onDismiss when dismiss button is clicked", async () => {
      const user = userEvent.setup();
      const onDismiss = jest.fn();

      render(<ErrorAlert error="Test error" onDismiss={onDismiss} />);

      const dismissButton = screen.getByText("Dismiss");
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("calls onDismiss only once per click", async () => {
      const user = userEvent.setup();
      const onDismiss = jest.fn();

      render(<ErrorAlert error="Test error" onDismiss={onDismiss} />);

      const dismissButton = screen.getByText("Dismiss");
      await user.click(dismissButton);
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(2);
    });

    it("handles keyboard interaction on dismiss button", async () => {
      const user = userEvent.setup();
      const onDismiss = jest.fn();

      render(<ErrorAlert error="Test error" onDismiss={onDismiss} />);

      const dismissButton = screen.getByText("Dismiss");
      dismissButton.focus();

      await user.keyboard("{Enter}");
      expect(onDismiss).toHaveBeenCalledTimes(1);

      await user.keyboard(" ");
      expect(onDismiss).toHaveBeenCalledTimes(2);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<ErrorAlert {...defaultProps} />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "polite");
      expect(alert).toHaveAttribute("aria-atomic");
    });

    it("has descriptive aria-label on dismiss button", () => {
      const errorMessage = "Network connection failed";
      render(
        <ErrorAlert error={errorMessage} onDismiss={defaultProps.onDismiss} />,
      );

      const dismissButton = screen.getByRole("button");
      expect(dismissButton).toHaveAttribute(
        "aria-label",
        `Dismiss error: ${errorMessage}`,
      );
    });

    it("has aria-describedby attribute on dismiss button", () => {
      render(<ErrorAlert {...defaultProps} />);

      const dismissButton = screen.getByRole("button");
      expect(dismissButton).toHaveAttribute(
        "aria-describedby",
        "error-message",
      );
    });

    it("is focusable and keyboard accessible", () => {
      render(<ErrorAlert {...defaultProps} />);

      const dismissButton = screen.getByRole("button");
      dismissButton.focus();

      expect(dismissButton).toHaveFocus();
      expect(dismissButton).toHaveAttribute("type", "button");
    });

    it("announces error to screen readers", () => {
      render(<ErrorAlert {...defaultProps} />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "polite");
      expect(alert).toContainElement(screen.getByText("Something went wrong"));
    });
  });

  describe("Styling and Layout", () => {
    it("applies correct styling classes", () => {
      render(<ErrorAlert {...defaultProps} />);

      const container = screen.getByRole("alert");
      expect(container).toHaveClass(
        "mb-4",
        "rounded-md",
        "border",
        "border-red-200",
        "bg-red-50",
        "p-4",
      );
    });

    it("applies correct text styling", () => {
      render(<ErrorAlert {...defaultProps} />);

      const errorText = screen.getByText("Something went wrong");
      const dismissButton = screen.getByText("Dismiss");

      expect(errorText.closest("div")).toHaveClass("text-sm", "text-red-700");
      expect(dismissButton).toHaveClass(
        "mt-2",
        "text-red-600",
        "underline",
        "hover:text-red-500",
      );
    });

    it("maintains consistent layout structure", () => {
      render(<ErrorAlert {...defaultProps} />);

      const alert = screen.getByRole("alert");
      const flexContainer = alert.querySelector(".flex");
      const textContainer = flexContainer?.querySelector(".text-sm");

      expect(flexContainer).toBeInTheDocument();
      expect(textContainer).toBeInTheDocument();
      expect(textContainer).toHaveClass("text-red-700");
    });
  });

  describe("Component Behavior", () => {
    it("is memoized and prevents unnecessary re-renders", () => {
      const { rerender } = render(<ErrorAlert {...defaultProps} />);

      const alert = screen.getByRole("alert");
      const initialElement = alert;

      // Re-render with same props
      rerender(<ErrorAlert {...defaultProps} />);

      const updatedAlert = screen.getByRole("alert");
      expect(updatedAlert).toBe(initialElement);
    });

    it("has correct display name", () => {
      expect(ErrorAlert.displayName).toBe("ErrorAlert");
    });

    it("updates when error message changes", () => {
      const { rerender } = render(
        <ErrorAlert error="First error" onDismiss={defaultProps.onDismiss} />,
      );

      expect(screen.getByText("First error")).toBeInTheDocument();

      rerender(
        <ErrorAlert error="Second error" onDismiss={defaultProps.onDismiss} />,
      );

      expect(screen.getByText("Second error")).toBeInTheDocument();
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });

    it("updates aria-label when error message changes", () => {
      const { rerender } = render(
        <ErrorAlert error="First error" onDismiss={defaultProps.onDismiss} />,
      );

      let dismissButton = screen.getByRole("button");
      expect(dismissButton).toHaveAttribute(
        "aria-label",
        "Dismiss error: First error",
      );

      rerender(
        <ErrorAlert error="Second error" onDismiss={defaultProps.onDismiss} />,
      );

      dismissButton = screen.getByRole("button");
      expect(dismissButton).toHaveAttribute(
        "aria-label",
        "Dismiss error: Second error",
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles empty error message", () => {
      render(<ErrorAlert error="" onDismiss={defaultProps.onDismiss} />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();

      const dismissButton = screen.getByRole("button");
      expect(dismissButton).toHaveAttribute("aria-label", "Dismiss error: ");
    });

    it("handles very long error messages", () => {
      const longError = "A".repeat(1000);
      render(
        <ErrorAlert error={longError} onDismiss={defaultProps.onDismiss} />,
      );

      expect(screen.getByText(longError)).toBeInTheDocument();

      const dismissButton = screen.getByRole("button");
      expect(dismissButton).toHaveAttribute(
        "aria-label",
        `Dismiss error: ${longError}`,
      );
    });

    it("handles error messages with HTML-like content", () => {
      const htmlError = "<script>alert('xss')</script>Error occurred";
      render(
        <ErrorAlert error={htmlError} onDismiss={defaultProps.onDismiss} />,
      );

      expect(screen.getByText(htmlError)).toBeInTheDocument();
      // Should render as text, not execute as HTML
      expect(screen.queryByRole("script")).not.toBeInTheDocument();
    });

    it("handles missing onDismiss gracefully", () => {
      // @ts-expect-error - Testing missing required prop
      render(<ErrorAlert error="Test error" />);

      expect(screen.getByText("Test error")).toBeInTheDocument();
      expect(screen.getByText("Dismiss")).toBeInTheDocument();
    });

    it("handles null or undefined error gracefully", () => {
      // @ts-expect-error - Testing invalid prop type
      render(<ErrorAlert error={null} onDismiss={defaultProps.onDismiss} />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });

  describe("Integration Scenarios", () => {
    it("works within form contexts", () => {
      render(
        <form>
          <input type="text" />
          <ErrorAlert
            error="Form validation failed"
            onDismiss={defaultProps.onDismiss}
          />
        </form>,
      );

      expect(screen.getByText("Form validation failed")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("works with multiple error alerts", () => {
      render(
        <div>
          <ErrorAlert error="First error" onDismiss={jest.fn()} />
          <ErrorAlert error="Second error" onDismiss={jest.fn()} />
        </div>,
      );

      expect(screen.getByText("First error")).toBeInTheDocument();
      expect(screen.getByText("Second error")).toBeInTheDocument();

      const alerts = screen.getAllByRole("alert");
      expect(alerts).toHaveLength(2);
    });

    it("maintains focus after dismissal", async () => {
      const user = userEvent.setup();
      const onDismiss = jest.fn();

      render(
        <div>
          <button>Previous element</button>
          <ErrorAlert error="Test error" onDismiss={onDismiss} />
          <button>Next element</button>
        </div>,
      );

      const dismissButton = screen.getByText("Dismiss");
      dismissButton.focus();

      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("handles rapid error changes efficiently", () => {
      const { rerender } = render(
        <ErrorAlert error="Error 1" onDismiss={defaultProps.onDismiss} />,
      );

      // Rapid error changes
      for (let i = 2; i <= 10; i++) {
        rerender(
          <ErrorAlert
            error={`Error ${i}`}
            onDismiss={defaultProps.onDismiss}
          />,
        );
      }

      expect(screen.getByText("Error 10")).toBeInTheDocument();
      expect(screen.queryByText("Error 9")).not.toBeInTheDocument();
    });

    it("handles frequent dismiss interactions", async () => {
      const user = userEvent.setup();
      const onDismiss = jest.fn();

      render(<ErrorAlert error="Test error" onDismiss={onDismiss} />);

      const dismissButton = screen.getByText("Dismiss");

      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await user.click(dismissButton);
      }

      expect(onDismiss).toHaveBeenCalledTimes(5);
    });
  });
});
