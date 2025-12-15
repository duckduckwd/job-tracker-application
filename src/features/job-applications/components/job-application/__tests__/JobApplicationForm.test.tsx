import { render, screen } from "@testing-library/react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { JobApplicationForm } from "../JobApplicationForm";

// Mock the JobApplicationSections component
jest.mock("../JobApplicationSections", () => ({
  JobApplicationSections: () => <div data-testid="job-application-sections" />,
}));

const TestWrapper = ({
  onSubmit = jest.fn().mockResolvedValue(undefined),
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

describe("JobApplicationForm", () => {
  it("attempts to focus submit button when isSubmitting becomes true", () => {
    const focusSpy = jest.spyOn(HTMLElement.prototype, "focus");
    const { rerender } = render(<TestWrapper isSubmitting={false} />);

    // Re-render with isSubmitting=true to trigger the useEffect
    rerender(<TestWrapper isSubmitting={true} />);

    // Verify that focus was called (even though button is disabled)
    expect(focusSpy).toHaveBeenCalled();

    focusSpy.mockRestore();
  });

  it("renders form with correct attributes when submitting", () => {
    render(<TestWrapper isSubmitting={true} />);

    const form = screen.getByRole("form");
    expect(form).toHaveAttribute("aria-busy", "true");

    const fieldset = form.querySelector("fieldset");
    expect(fieldset).toBeDisabled();
  });
});
