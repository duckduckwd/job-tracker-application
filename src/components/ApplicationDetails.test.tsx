import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import ApplicationDetails from "./ApplicationDetails";

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
  // Role section is open by default
  await user.type(screen.getByLabelText("Role"), data.role);
  await user.type(screen.getByLabelText("Company"), data.company);
  await user.type(screen.getByLabelText("Role Type"), data.roleType);
  await user.type(screen.getByLabelText("Location"), data.location);
  await user.type(screen.getByLabelText("Salary"), data.salary);

  // Open timeline section for advert link
  await openSection(user, "Timeline");
  await user.type(screen.getByLabelText("Advert Link"), data.advertLink);
};

describe("ApplicationDetails", () => {
  describe("form validation", () => {
    it("should show error when required field is left empty on blur", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText("Role");
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      expect(await screen.findByText("Role is required")).toBeInTheDocument();
    });

    it("should show error for invalid email format", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText("Role");
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      expect(await screen.findByText("Role is required")).toBeInTheDocument();

      await user.type(roleInput, "Software Engineer");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText("Role is required")).not.toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    it("should prevent submission with invalid data", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText("Role");
      await user.type(roleInput, "a");
      await user.clear(roleInput);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      await user.click(submitButton);

      expect(await screen.findByText("Role is required")).toBeInTheDocument();
    });

    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      render(<ApplicationDetails />);

      await fillRequiredFields(user);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Form submitted");
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            roleTitle: "Software Engineer",
            companyName: "Tech Corp",
            roleType: "Full-time",
            location: "London",
            salary: "£50,000",
            advertLink: "https://example.com/job",
          }),
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("user interactions", () => {
    it("should allow user to toggle LinkedIn connection switch", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

      // Open contact section first
      await openSection(user, "Contact");

      const linkedInSwitch = screen.getByRole("switch", {
        name: /linkedin connection/i,
      });

      expect(linkedInSwitch).not.toBeChecked();

      await user.click(linkedInSwitch);

      expect(linkedInSwitch).toBeChecked();
    });

    it("should accept optional fields as empty", async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      render(<ApplicationDetails />);

      await fillRequiredFields(user);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Form submitted");
      });

      consoleSpy.mockRestore();
    });
  });

  describe("accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<ApplicationDetails />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no violations with validation errors visible", async () => {
      const user = userEvent.setup();
      const { container } = render(<ApplicationDetails />);

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
      const { container } = render(<ApplicationDetails />);

      // Open all sections
      await openSection(user, "Timeline");
      await openSection(user, "Contact");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible collapsible buttons", () => {
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

      const submitButton = screen.getByRole("button", {
        name: /save application details/i,
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should associate error messages with inputs", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      const errorMessage = await screen.findByText("Role is required");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass("text-red-500");
    });

    it("should mark invalid fields with aria-invalid", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, "a");
      await user.clear(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(roleInput).toHaveAttribute("aria-invalid", "true");
      });

      await user.type(roleInput, "Software Engineer");
      await user.tab();

      await waitFor(() => {
        expect(roleInput).not.toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate through form using only keyboard", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

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
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      render(<ApplicationDetails />);

      await fillRequiredFields(user);

      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Form submitted");
      });

      consoleSpy.mockRestore();
    });

    it("should allow shift+tab to navigate backwards", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, "Software Engineer");

      // Open contact section
      await openSection(user, "Contact");

      const emailInput = screen.getByLabelText(/contact email/i);
      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Must be a valid email")).toBeInTheDocument();
      });

      expect(roleInput).toHaveValue("Software Engineer");
      expect(emailInput).toHaveValue("invalid-email");
    });

    it("should handle very long input values", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

      const longString = "a".repeat(1000);
      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, longString);

      expect(roleInput).toHaveValue(longString);
    });

    it("should handle collapsible section interactions", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, "Senior <Developer> & Architect");

      expect(roleInput).toHaveValue("Senior <Developer> & Architect");
    });

    it("should handle rapid field interactions", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

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
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.paste("Software Engineer");

      expect(roleInput).toHaveValue("Software Engineer");
    });
  });

  describe("performance", () => {
    it("should render within performance budget", () => {
      const start = performance.now();
      render(<ApplicationDetails />);
      const end = performance.now();

      expect(end - start).toBeLessThan(200);
    });

    it("should handle multiple re-renders efficiently", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ApplicationDetails />);

      const start = performance.now();
      for (let i = 0; i < 5; i++) {
        rerender(<ApplicationDetails />);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(100);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, "Test");
      expect(roleInput).toHaveValue("Test");
    });
  });
});
