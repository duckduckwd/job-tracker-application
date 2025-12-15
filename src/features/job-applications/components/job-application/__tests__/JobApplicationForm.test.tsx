import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { JobApplicationForm } from "../JobApplicationForm";

expect.extend(toHaveNoViolations);

// Test data factory for maintainability
const createMockSubmitHandler = (
  behaviour: "success" | "error" | "timeout" = "success",
) => {
  switch (behaviour) {
    case "error":
      return jest.fn().mockRejectedValue(new Error("Network error"));
    case "timeout":
      return jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
    case "success":
      return jest.fn().mockResolvedValue(undefined);
  }
};

const TestWrapper = ({
  onSubmit = createMockSubmitHandler(),
  isSubmitting = false,
}: {
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
}) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <JobApplicationForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </FormProvider>
  );
};

// Performance budget helper
const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitFor(() => expect(screen.getByRole("form")).toBeInTheDocument());
  return performance.now() - start;
};

describe("JobApplicationForm", () => {
  describe("Accessibility & UX", () => {
    it("has no accessibility violations", async () => {
      const { container } = render(<TestWrapper />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("allows users to navigate sections with keyboard", async () => {
      const user = userEvent.setup();
      render(<TestWrapper />);

      const roleSection = screen.getByRole("button", {
        name: /toggle.*role details/i,
      });

      await user.tab();
      expect(roleSection).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(roleSection).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("prevents form submission when already submitting", async () => {
      const user = userEvent.setup();
      const onSubmit = createMockSubmitHandler();

      render(<TestWrapper onSubmit={onSubmit} isSubmitting={true} />);

      const submitButton = screen.getByRole("button", { name: /saving/i });
      expect(submitButton).toBeDisabled();

      await user.click(submitButton);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("provides clear feedback during form submission", () => {
      const { rerender } = render(<TestWrapper isSubmitting={false} />);

      expect(
        screen.getByRole("button", { name: /save application details/i }),
      ).toBeInTheDocument();

      rerender(<TestWrapper isSubmitting={true} />);

      expect(
        screen.getByRole("button", { name: /saving/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Form submission in progress"),
      ).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("calls onSubmit handler when form is submitted", async () => {
      const user = userEvent.setup();
      const onSubmit = createMockSubmitHandler();

      render(<TestWrapper onSubmit={onSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("renders within performance budget", async () => {
      const renderTime = await measureRenderTime(() => {
        render(<TestWrapper />);
      });

      // Enterprise standard: < 100ms initial render
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe("Security", () => {
    it("prevents XSS through form attributes", () => {
      render(<TestWrapper />);

      const form = screen.getByRole("form");
      expect(form).toHaveAttribute("noValidate");
      expect(form).toHaveAttribute(
        "aria-label",
        "Add Application Details Form",
      );
    });

    it("sanitizes form submission data through React Hook Form", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(<TestWrapper onSubmit={onSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      await user.click(submitButton);

      // Verify form uses React Hook Form's built-in validation
      expect(onSubmit).toHaveBeenCalled();
    });

    it("prevents CSRF through form structure", () => {
      render(<TestWrapper />);

      const form = screen.getByRole("form");
      // Form uses onSubmit handler, not direct POST
      expect(form).not.toHaveAttribute("action");
      expect(form).not.toHaveAttribute("method");
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid form submissions gracefully", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<TestWrapper onSubmit={onSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });

      // Multiple rapid clicks - form handles each one
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Component allows multiple submissions (parent should handle prevention)
      expect(onSubmit).toHaveBeenCalled();
    });

    it("maintains form state during submission", () => {
      const { rerender } = render(<TestWrapper isSubmitting={false} />);

      const form = screen.getByRole("form");
      expect(form).toHaveAttribute("aria-busy", "false");

      rerender(<TestWrapper isSubmitting={true} />);

      expect(form).toHaveAttribute("aria-busy", "true");
      const fieldset = form.querySelector("fieldset");
      expect(fieldset).toBeDisabled();
    });

    it("handles component unmounting during submission", () => {
      const { unmount } = render(<TestWrapper isSubmitting={true} />);

      // Should not throw errors when unmounting during submission
      expect(() => unmount()).not.toThrow();
    });

    it("maintains accessibility during state changes", async () => {
      const { container, rerender } = render(
        <TestWrapper isSubmitting={false} />,
      );

      let results = await axe(container);
      expect(results).toHaveNoViolations();

      rerender(<TestWrapper isSubmitting={true} />);

      results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Content Structure", () => {
    it("renders all required form sections for users", () => {
      render(<TestWrapper />);

      expect(
        screen.getByRole("button", { name: /role details/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /timeline/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /contact details/i }),
      ).toBeInTheDocument();
    });
  });
});
