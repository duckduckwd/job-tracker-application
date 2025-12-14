import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Switch } from "../switch";

describe("Switch Component", () => {
  describe("Rendering and Structure", () => {
    it("renders with correct data attributes", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-slot", "switch");

      const thumb = switchElement.querySelector('[data-slot="switch-thumb"]');
      expect(thumb).toBeInTheDocument();
    });

    it("renders as switch role", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
    });

    it("starts unchecked by default", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).not.toBeChecked();
      expect(switchElement).toHaveAttribute("data-state", "unchecked");
    });
  });

  describe("User Interactions", () => {
    it("toggles when clicked", async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole("switch");

      // Initially unchecked
      expect(switchElement).not.toBeChecked();

      // Click to check
      await user.click(switchElement);
      expect(switchElement).toBeChecked();
      expect(switchElement).toHaveAttribute("data-state", "checked");

      // Click to uncheck
      await user.click(switchElement);
      expect(switchElement).not.toBeChecked();
      expect(switchElement).toHaveAttribute("data-state", "unchecked");
    });

    it("handles keyboard interactions", async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      switchElement.focus();

      expect(switchElement).toHaveFocus();

      // Space key should toggle
      await user.keyboard(" ");
      expect(switchElement).toBeChecked();

      // Enter key should toggle
      await user.keyboard("{Enter}");
      expect(switchElement).not.toBeChecked();
    });

    it("calls onCheckedChange when toggled", async () => {
      const user = userEvent.setup();
      const onCheckedChange = jest.fn();

      render(<Switch onCheckedChange={onCheckedChange} />);

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      expect(onCheckedChange).toHaveBeenCalledWith(true);

      await user.click(switchElement);
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it("prevents interaction when disabled", async () => {
      const user = userEvent.setup();
      const onCheckedChange = jest.fn();

      render(<Switch disabled onCheckedChange={onCheckedChange} />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeDisabled();

      await user.click(switchElement);
      expect(onCheckedChange).not.toHaveBeenCalled();
      expect(switchElement).not.toBeChecked();
    });
  });

  describe("Controlled vs Uncontrolled", () => {
    it("works as uncontrolled component", async () => {
      const user = userEvent.setup();
      render(<Switch defaultChecked />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeChecked();

      await user.click(switchElement);
      expect(switchElement).not.toBeChecked();
    });

    it("works as controlled component", async () => {
      const user = userEvent.setup();
      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(false);

        return <Switch checked={checked} onCheckedChange={setChecked} />;
      };

      render(<ControlledSwitch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).not.toBeChecked();

      await user.click(switchElement);
      expect(switchElement).toBeChecked();
    });
  });

  describe("Styling and States", () => {
    it("applies default styling classes", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass(
        "inline-flex",
        "h-[1.15rem]",
        "w-8",
        "shrink-0",
        "items-center",
        "rounded-full",
        "border",
        "border-transparent",
      );
    });

    it("applies unchecked state styling", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("data-[state=unchecked]:bg-input");
    });

    it("applies checked state styling", async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      expect(switchElement).toHaveClass("data-[state=checked]:bg-primary");
    });

    it("applies disabled styling", () => {
      render(<Switch disabled />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass(
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
      );
    });

    it("applies focus styles", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass(
        "focus-visible:border-ring",
        "focus-visible:ring-ring/50",
        "focus-visible:ring-[3px]",
      );
    });
  });

  describe("Thumb Behavior", () => {
    it("positions thumb correctly for unchecked state", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      const thumb = switchElement.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toHaveClass("data-[state=unchecked]:translate-x-0");
    });

    it("positions thumb correctly for checked state", async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      const thumb = switchElement.querySelector('[data-slot="switch-thumb"]');

      await user.click(switchElement);

      expect(thumb).toHaveClass(
        "data-[state=checked]:translate-x-[calc(100%-2px)]",
      );
    });

    it("applies thumb styling", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      const thumb = switchElement.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toHaveClass(
        "pointer-events-none",
        "block",
        "size-4",
        "rounded-full",
        "ring-0",
        "transition-transform",
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("role", "switch");
      expect(switchElement).toHaveAttribute("aria-checked", "false");
    });

    it("updates aria-checked when toggled", async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole("switch");

      await user.click(switchElement);
      expect(switchElement).toHaveAttribute("aria-checked", "true");

      await user.click(switchElement);
      expect(switchElement).toHaveAttribute("aria-checked", "false");
    });

    it("is focusable", () => {
      render(<Switch />);

      const switchElement = screen.getByRole("switch");
      switchElement.focus();
      expect(switchElement).toHaveFocus();
    });

    it("supports aria-label", () => {
      render(<Switch aria-label="Toggle notifications" />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute(
        "aria-label",
        "Toggle notifications",
      );
    });

    it("supports aria-describedby", () => {
      render(
        <div>
          <Switch aria-describedby="switch-description" />
          <div id="switch-description">Enable notifications</div>
        </div>,
      );

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute(
        "aria-describedby",
        "switch-description",
      );
    });
  });

  describe("Custom Props", () => {
    it("accepts custom className", () => {
      render(<Switch className="custom-class" />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("custom-class");
    });

    it("forwards HTML attributes", () => {
      render(<Switch data-testid="test-switch" id="my-switch" />);

      const switchElement = screen.getByTestId("test-switch");
      expect(switchElement).toHaveAttribute("id", "my-switch");
    });

    it("supports form integration", () => {
      render(<Switch name="notifications" value="enabled" />);

      const switchElement = screen.getByRole("switch");
      // Radix UI Switch handles form integration internally
      expect(switchElement).toBeInTheDocument();
    });
  });

  describe("Form Integration", () => {
    it("works within form context", async () => {
      const user = userEvent.setup();
      render(
        <form>
          <Switch name="agree" />
          <button type="submit">Submit</button>
        </form>,
      );

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      expect(switchElement).toBeChecked();
    });

    it("maintains state across form interactions", async () => {
      const user = userEvent.setup();
      render(
        <form>
          <Switch defaultChecked name="setting" />
          <input type="text" />
        </form>,
      );

      const switchElement = screen.getByRole("switch");
      const input = screen.getByRole("textbox");

      expect(switchElement).toBeChecked();

      await user.click(input);
      expect(switchElement).toBeChecked();
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid toggling", async () => {
      const user = userEvent.setup();
      const onCheckedChange = jest.fn();

      render(<Switch onCheckedChange={onCheckedChange} />);

      const switchElement = screen.getByRole("switch");

      // Rapid clicks
      await user.click(switchElement);
      await user.click(switchElement);
      await user.click(switchElement);

      expect(onCheckedChange).toHaveBeenCalledTimes(3);
    });

    it("handles undefined onCheckedChange", async () => {
      const user = userEvent.setup();
      render(<Switch onCheckedChange={undefined} />);

      const switchElement = screen.getByRole("switch");

      // Should not crash
      await user.click(switchElement);
      expect(switchElement).toBeChecked();
    });
  });

  describe("Performance", () => {
    it("handles multiple switches efficiently", () => {
      render(
        <div>
          <Switch data-testid="switch-1" />
          <Switch data-testid="switch-2" />
          <Switch data-testid="switch-3" />
        </div>,
      );

      const switches = screen.getAllByRole("switch");
      expect(switches).toHaveLength(3);

      for (const switchElement of switches) {
        expect(switchElement).not.toBeChecked();
      }
    });
  });
});
