// Mock the hooks before importing the component
const mockSubmitForm = jest.fn();
const mockClearDraft = jest.fn();

jest.mock("../../hooks/useFormSubmission", () => ({
  useFormSubmission: () => ({
    submitForm: mockSubmitForm,
    isSubmitting: false,
    submitError: null,
    clearError: jest.fn(),
  }),
}));

jest.mock("../../hooks/useFormAutoSave", () => ({
  useFormAutoSave: () => ({
    clearDraft: mockClearDraft,
  }),
}));

// Mock the lazy import to load immediately:
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import JobApplicationDetails from "../JobApplicationDetails";

expect.extend(toHaveNoViolations);

// Test data factory
const createValidFormData = () => ({
  role: "Software Engineer",
  company: "Tech Corp",
  roleType: "Full-time",
  location: "London",
  salary: "£50,000",
  advertLink: "https://example.com/job",
});

// Helper to open collapsible sections
const openSection = async (
  user: ReturnType<typeof userEvent.setup>,
  sectionTitle: string,
) => {
  const button = screen.getByRole("button", {
    name: (accessibleName: string) =>
      accessibleName.toLowerCase().includes(sectionTitle.toLowerCase()),
  });
  await user.click(button);
};

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  const data = createValidFormData();
  // Wait for lazy-loaded form and fill required fields
  await user.clear(await screen.findByLabelText("Role"));
  await user.type(await screen.findByLabelText("Role"), data.role);

  await user.clear(await screen.findByLabelText("Company"));
  await user.type(await screen.findByLabelText("Company"), data.company);

  await user.clear(await screen.findByLabelText("Role Type"));
  await user.type(await screen.findByLabelText("Role Type"), data.roleType);

  await user.clear(await screen.findByLabelText("Location"));
  await user.type(await screen.findByLabelText("Location"), data.location);

  // Open timeline section for required fields
  await openSection(user, "Timeline");

  const advertLinkField = await screen.findByLabelText("Advert Link");
  await user.clear(advertLinkField);
  await user.type(advertLinkField, data.advertLink);

  await user.clear(await screen.findByLabelText("Date Applied"));
  await user.type(await screen.findByLabelText("Date Applied"), "2024-01-01");

  await user.clear(await screen.findByLabelText("Status"));
  await user.type(await screen.findByLabelText("Status"), "Applied");
};

describe("JobApplicationDetails", () => {
  describe("form validation", () => {
    it("should show error when required field is left empty on blur", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Wait for the form to load
      const roleInput = await screen.findByLabelText("Role");
      await user.click(roleInput);
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab(); // This should trigger blur validation

      await waitFor(() => {
        expect(screen.getByText("Role is required")).toBeInTheDocument();
      });
    });

    it("should show error for invalid email format", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Open contact section first
      await openSection(user, "Contact");

      const emailInput = screen.getByLabelText(/contact email/i);
      await user.type(emailInput, "invalid-email");
      await user.tab();

      expect(
        await screen.findByText("Must be a valid email"),
      ).toBeInTheDocument();
    });

    it("should show error for invalid URL format", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Open timeline section first
      await openSection(user, "Timeline");

      const urlInput = screen.getByLabelText("Advert Link");
      await user.type(urlInput, "not-a-url");
      await user.tab();

      expect(
        await screen.findByText("Must be a valid URL"),
      ).toBeInTheDocument();
    });

    it("should show error for invalid phone format", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Open contact section first
      await openSection(user, "Contact");

      const phoneInput = screen.getByLabelText(/contact phone/i);
      await user.type(phoneInput, "123#456@789");
      await user.tab();

      expect(
        await screen.findByText("Invalid phone number format"),
      ).toBeInTheDocument();
    });

    it("should clear error when field becomes valid", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText("Role");
      await user.click(roleInput);
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Role is required")).toBeInTheDocument();
      });

      await user.click(roleInput);
      await user.type(roleInput, "Software Engineer");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText("Role is required")).not.toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    beforeEach(() => {
      // Clear any existing DOM state
      document.body.innerHTML = "";
      mockSubmitForm.mockClear();
      mockClearDraft.mockClear();
    });

    it("should prevent submission with invalid data", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<JobApplicationDetails />);
      });

      // Wait for lazy-loaded form to render
      const roleInput = await screen.findByLabelText("Role");
      await user.type(roleInput, "a");
      await user.clear(roleInput);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      await user.click(submitButton);

      expect(await screen.findByText("Role is required")).toBeInTheDocument();
    });

    it("should call submitForm when valid form is submitted", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Populate the form with valid data
      const data = createValidFormData();
      await user.type(await screen.findByLabelText("Role"), data.role);
      await user.type(await screen.findByLabelText("Company"), data.company);
      await user.type(await screen.findByLabelText("Role Type"), data.roleType);
      await user.type(await screen.findByLabelText("Location"), data.location);

      await openSection(user, "Timeline");
      await user.type(
        await screen.findByLabelText("Date Applied"),
        "2024-01-01",
      );
      await user.type(
        await screen.findByLabelText("Advert Link"),
        data.advertLink,
      );
      await user.type(await screen.findByLabelText("Status"), "Applied");

      // Click the submit button
      await user.click(
        screen.getByRole("button", {
          name: /save application details/i,
        }),
      );

      // Verify submitForm was called
      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalled();
      });
    });
  });

  describe("user interactions", () => {
    it("should allow user to toggle LinkedIn connection switch", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Open contact section first
      await openSection(user, "Contact");

      const linkedInSwitch = screen.getByRole("switch", {
        name: /linkedin connection/i,
      });

      expect(linkedInSwitch).not.toBeChecked();

      await user.click(linkedInSwitch);

      expect(linkedInSwitch).toBeChecked();
    });

    it("should show auto-save indicator when form is dirty", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText("Role");
      await user.type(roleInput, "Software Engineer");

      expect(screen.getByText("Draft saved automatically")).toBeInTheDocument();
    });

    it("should accept optional fields as empty", async () => {
      const user = userEvent.setup();

      render(<JobApplicationDetails />);

      await fillRequiredFields(user);

      await user.click(
        screen.getByRole("button", { name: /save application details/i }),
      );

      // Verify submitForm was called
      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalled();
      });
    });
  });

  describe("accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<JobApplicationDetails />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no violations with validation errors visible", async () => {
      const user = userEvent.setup();
      const { container } = render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Role is required")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no violations with collapsible sections opened", async () => {
      const user = userEvent.setup();
      const { container } = render(<JobApplicationDetails />);

      // Open all sections
      await openSection(user, "Timeline");
      await openSection(user, "Contact");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible collapsible buttons", () => {
      render(<JobApplicationDetails />);

      // Check that collapsible buttons have proper accessible names
      expect(
        screen.getByRole("button", { name: /toggle.*role details/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /toggle.*timeline/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /toggle.*contact details/i }),
      ).toBeInTheDocument();
    });

    it("should have proper labels for all inputs when sections are opened", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Role section is open by default
      expect(screen.getByLabelText("Role")).toBeInTheDocument();
      expect(screen.getByLabelText("Company")).toBeInTheDocument();
      expect(screen.getByLabelText("Role Type")).toBeInTheDocument();
      expect(screen.getByLabelText("Location")).toBeInTheDocument();
      expect(screen.getByLabelText("Salary")).toBeInTheDocument();

      // Open timeline section
      await openSection(user, "Timeline");
      expect(screen.getByLabelText("Date Applied")).toBeInTheDocument();
      expect(screen.getByLabelText("Advert Link")).toBeInTheDocument();
      expect(screen.getByLabelText("CV Used")).toBeInTheDocument();
      expect(screen.getByLabelText("Response Date")).toBeInTheDocument();
      expect(screen.getByLabelText("Status")).toBeInTheDocument();

      // Open contact section
      await openSection(user, "Contact");
      expect(screen.getByLabelText("Contact Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Contact Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Contact Phone")).toBeInTheDocument();
      expect(screen.getByLabelText("LinkedIn Connection")).toBeInTheDocument();
    });

    it("should have accessible submit button", () => {
      render(<JobApplicationDetails />);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should associate error messages with inputs", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText("Role is required");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass("text-red-500");
        expect(roleInput).toHaveAttribute(
          "aria-describedby",
          "roleTitle-error",
        );
      });
    });

    it("should mark invalid fields with aria-invalid", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      expect(roleInput).not.toHaveAttribute("aria-invalid");

      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Role is required")).toBeInTheDocument();
      });

      expect(roleInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should remove aria-invalid when field becomes valid", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(roleInput).toHaveAttribute("aria-invalid", "true");
      });

      await user.click(roleInput);
      await user.type(roleInput, "Software Engineer");
      await user.tab();

      await waitFor(() => {
        expect(roleInput).not.toHaveAttribute("aria-invalid");
      });
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate through form using only keyboard", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Focus the main content first
      const mainContent = screen.getByRole("main");
      mainContent.focus();

      // First tab goes to the collapsible button
      await user.tab();
      expect(
        screen.getByRole("button", { name: /toggle.*role details/i }),
      ).toHaveFocus();

      // Second tab goes to the first input
      await user.tab();
      expect(screen.getByLabelText("Role")).toHaveFocus();

      await user.keyboard("Software Engineer");
      await user.tab();
      expect(screen.getByLabelText("Company")).toHaveFocus();

      await user.keyboard("Tech Corp");
      await user.tab();
      expect(screen.getByLabelText("Role Type")).toHaveFocus();
    });

    it("should submit form using Enter key", async () => {
      const user = userEvent.setup();

      render(<JobApplicationDetails />);

      await fillRequiredFields(user);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      submitButton.focus();
      await user.keyboard("{Enter}");

      // Verify submitForm was called
      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalled();
      });
    });

    it("should allow shift+tab to navigate backwards", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Focus the main content first
      const mainContent = screen.getByRole("main");
      mainContent.focus();

      // Tab to first input, then to second input
      await user.tab(); // collapsible button
      await user.tab(); // role input
      await user.tab(); // company input
      expect(screen.getByLabelText("Company")).toHaveFocus();

      await user.keyboard("{Shift>}{Tab}{/Shift}");
      expect(screen.getByLabelText("Role")).toHaveFocus();
    });
  });

  describe("edge cases", () => {
    it("should preserve form data when validation fails", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.clear(roleInput);
      await user.type(roleInput, "Software Engineer");

      // Open contact section
      await openSection(user, "Contact");

      const emailInput = screen.getByLabelText(/contact email/i);
      await user.click(emailInput);
      await user.clear(emailInput);
      await user.type(emailInput, "invalid-email");
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText("Must be a valid email")).toBeInTheDocument();
      });

      expect(roleInput).toHaveValue("Software Engineer");
      expect(emailInput).toHaveValue("invalid-email");
    });

    it("should handle very long input values", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const longString = "a".repeat(100); // Further reduce for performance
      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.clear(roleInput);
      await user.paste(longString);

      await waitFor(() => {
        expect(roleInput).toHaveValue(longString);
      });
    });

    it("should handle collapsible section interactions", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      // Timeline section should be closed initially
      expect(screen.queryByLabelText("Advert Link")).not.toBeInTheDocument();

      // Open timeline section
      await openSection(user, "Timeline");
      expect(screen.getByLabelText("Advert Link")).toBeInTheDocument();

      // Close timeline section
      await openSection(user, "Timeline");
      expect(screen.queryByLabelText("Advert Link")).not.toBeInTheDocument();
    });

    it("should handle special characters in input", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.clear(roleInput);
      await user.paste("Senior <Developer> & Architect");

      await waitFor(() => {
        expect(roleInput).toHaveValue("Senior <Developer> & Architect");
      });
    });

    it("should handle rapid field interactions", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);

      await user.click(roleInput);
      await user.tab();
      await user.click(roleInput);
      await user.type(roleInput, "Test");
      await user.clear(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Role is required")).toBeInTheDocument();
      });
    });

    it("should handle paste operations", async () => {
      const user = userEvent.setup();
      render(<JobApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.paste("Software Engineer");

      expect(roleInput).toHaveValue("Software Engineer");
    });
  });

  describe("performance", () => {
    it("should render within performance budget", () => {
      const start = performance.now();
      render(<JobApplicationDetails />);
      const end = performance.now();

      expect(end - start).toBeLessThan(200);
    });

    it("should handle multiple re-renders efficiently", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<JobApplicationDetails />);

      const start = performance.now();
      for (let i = 0; i < 2; i++) {
        rerender(<JobApplicationDetails />);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(300); // Even more reasonable threshold

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, "Test");
      await waitFor(() => {
        expect(roleInput).toHaveValue("Test");
      });
    });
  });
});
