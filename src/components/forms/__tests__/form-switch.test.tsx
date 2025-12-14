import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { FormSwitch } from "../form-switch";

const TestWrapper = ({ ...props }: any) => {
  const { register } = useForm();
  return <FormSwitch register={register} {...props} />;
};

describe("FormSwitch", () => {
  const defaultProps = {
    label: "Enable Notifications",
    id: "notifications" as const,
  };

  it("renders switch and label correctly", () => {
    render(<TestWrapper {...defaultProps} />);

    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.getByLabelText("Enable Notifications")).toBeInTheDocument();
  });

  it("associates label with switch correctly", () => {
    render(<TestWrapper {...defaultProps} />);

    const switchElement = screen.getByRole("switch");
    const label = screen.getByText("Enable Notifications");

    expect(switchElement).toHaveAttribute("id", "notifications");
    expect(label).toHaveAttribute("for", "notifications");
  });

  it("applies correct layout classes", () => {
    const { container } = render(<TestWrapper {...defaultProps} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex items-center space-x-2");
  });

  it("can be toggled by user interaction", async () => {
    const user = userEvent.setup();
    render(<TestWrapper {...defaultProps} />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement).not.toBeChecked();

    await user.click(switchElement);
    expect(switchElement).toBeChecked();

    await user.click(switchElement);
    expect(switchElement).not.toBeChecked();
  });

  it("can be toggled by clicking label", async () => {
    const user = userEvent.setup();
    render(<TestWrapper {...defaultProps} />);

    const switchElement = screen.getByRole("switch");
    const label = screen.getByText("Enable Notifications");

    expect(switchElement).not.toBeChecked();

    await user.click(label);
    expect(switchElement).toBeChecked();
  });

  it("handles different field IDs", () => {
    render(<TestWrapper label="Remote Work" id="isRemote" />);

    const switchElement = screen.getByRole("switch");
    const label = screen.getByText("Remote Work");

    expect(switchElement).toHaveAttribute("id", "isRemote");
    expect(label).toHaveAttribute("for", "isRemote");
  });

  it("renders with different label text", () => {
    render(<TestWrapper label="Accept Terms" id="acceptTerms" />);

    expect(screen.getByLabelText("Accept Terms")).toBeInTheDocument();
    expect(screen.getByText("Accept Terms")).toBeInTheDocument();
  });

  it("integrates with react-hook-form register", () => {
    const TestFormWrapper = () => {
      const { register, watch } = useForm({
        defaultValues: { isLinkedInConnection: false },
      });
      const watchedValue = watch("isLinkedInConnection");

      return (
        <div>
          <FormSwitch
            label="LinkedIn Connection"
            id="isLinkedInConnection"
            register={register as any}
          />
          <div data-testid="value">{watchedValue ? "true" : "false"}</div>
        </div>
      );
    };

    render(<TestFormWrapper />);

    expect(screen.getByTestId("value")).toHaveTextContent("false");
  });

  it("maintains accessibility attributes", () => {
    render(<TestWrapper {...defaultProps} />);

    const switchElement = screen.getByRole("switch");

    // Switch should have proper ARIA attributes
    expect(switchElement).toHaveAttribute("role", "switch");
    expect(switchElement).toHaveAttribute("aria-checked");
  });

  it("handles keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<TestWrapper {...defaultProps} />);

    const switchElement = screen.getByRole("switch");

    // Focus the switch
    await user.tab();
    expect(switchElement).toHaveFocus();

    // Toggle with space key
    await user.keyboard(" ");
    expect(switchElement).toBeChecked();

    // Toggle with enter key
    await user.keyboard("{Enter}");
    expect(switchElement).not.toBeChecked();
  });

  it("renders multiple switches independently", () => {
    const MultiSwitchWrapper = () => {
      const { register } = useForm();
      return (
        <div>
          <FormSwitch
            label="LinkedIn Connection"
            id="isLinkedInConnection"
            register={register as any}
          />
          <FormSwitch label="CV Used" id="cvUsed" register={register as any} />
        </div>
      );
    };

    render(<MultiSwitchWrapper />);

    const switches = screen.getAllByRole("switch");
    expect(switches).toHaveLength(2);

    expect(screen.getByLabelText("LinkedIn Connection")).toBeInTheDocument();
    expect(screen.getByLabelText("CV Used")).toBeInTheDocument();
  });

  it("handles special characters in labels", () => {
    render(<TestWrapper label="Enable 2FA & Security" id="security" />);

    expect(screen.getByLabelText("Enable 2FA & Security")).toBeInTheDocument();
  });
});
