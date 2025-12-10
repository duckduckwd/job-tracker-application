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

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  const data = createValidFormData();
  await user.type(screen.getByLabelText(/^role$/i), data.role);
  await user.type(screen.getByLabelText(/company/i), data.company);
  await user.type(screen.getByLabelText(/role type/i), data.roleType);
  await user.type(screen.getByLabelText(/location/i), data.location);
  await user.type(screen.getByLabelText(/salary/i), data.salary);
  await user.type(screen.getByLabelText(/advert link/i), data.advertLink);
};

describe("ApplicationDetails", () => {
  describe("form validation", () => {
    it("should show error when required field is left empty on blur", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.tab();

      expect(await screen.findByText("Role is required")).toBeInTheDocument();
    });

    it("should show error for invalid email format", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

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

      const urlInput = screen.getByLabelText(/advert link/i);
      await user.type(urlInput, "not-a-url");
      await user.tab();

      expect(
        await screen.findByText("Must be a valid URL"),
      ).toBeInTheDocument();
    });

    it("should show error for invalid phone format", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

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

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
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

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.click(roleInput);
      await user.tab();

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
      await user.click(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Role is required")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper labels for all inputs", () => {
      render(<ApplicationDetails />);

      expect(screen.getByLabelText(/^role$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/advert link/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date applied/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cv used/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/response date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^status$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contact phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/linkedin connection/i)).toBeInTheDocument();
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
      await user.click(roleInput);
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

      await user.click(roleInput);
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
      await user.click(roleInput);
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

      await user.tab();
      expect(screen.getByLabelText(/^role$/i)).toHaveFocus();

      await user.keyboard("Software Engineer");
      await user.tab();
      expect(screen.getByLabelText(/company/i)).toHaveFocus();

      await user.keyboard("Tech Corp");
      await user.tab();
      expect(screen.getByLabelText(/role type/i)).toHaveFocus();
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

      await user.tab();
      await user.tab();
      expect(screen.getByLabelText(/company/i)).toHaveFocus();

      await user.keyboard("{Shift>}{Tab}{/Shift}");
      expect(screen.getByLabelText(/^role$/i)).toHaveFocus();
    });
  });

  describe("edge cases", () => {
    it("should preserve form data when validation fails", async () => {
      const user = userEvent.setup();
      render(<ApplicationDetails />);

      const roleInput = screen.getByLabelText(/^role$/i);
      await user.type(roleInput, "Software Engineer");

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
