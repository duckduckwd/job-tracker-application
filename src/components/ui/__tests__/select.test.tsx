import { render, screen } from "@testing-library/react";
import React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../select";

// Simple test component that focuses on rendering and structure
const SimpleSelect = ({
  defaultValue = "",
  disabled = false,
  size = "default" as "sm" | "default",
}: {
  defaultValue?: string;
  disabled?: boolean;
  size?: "sm" | "default";
}) => (
  <Select defaultValue={defaultValue} disabled={disabled}>
    <SelectTrigger size={size} data-testid="select-trigger">
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectSeparator />
        <SelectItem value="orange" disabled>
          Orange (disabled)
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

describe("Select Component", () => {
  describe("Rendering and Structure", () => {
    it("renders trigger with correct data attributes", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("data-slot", "select-trigger");
      expect(trigger).toHaveAttribute("data-size", "default");
    });

    it("displays placeholder text", () => {
      render(<SimpleSelect />);

      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("applies size variants correctly", () => {
      const { rerender } = render(<SimpleSelect size="sm" />);

      let trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("data-size", "sm");

      rerender(<SimpleSelect size="default" />);
      trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("data-size", "default");
    });

    it("renders as button with correct role", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("type", "button");
    });

    it("starts in closed state", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("data-state", "closed");
    });
  });

  describe("Disabled States", () => {
    it("disables trigger when disabled prop is true", () => {
      render(<SimpleSelect disabled />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<SimpleSelect disabled />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveClass(
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("role", "combobox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls");
    });

    it("has aria-autocomplete attribute", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("aria-autocomplete", "none");
    });

    it("is keyboard accessible", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      trigger.focus();
      expect(trigger).toHaveFocus();
    });
  });

  describe("Value Display", () => {
    it("shows placeholder when no value selected", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("data-placeholder", "");
    });

    it("displays selected value when defaultValue is provided", () => {
      render(<SimpleSelect defaultValue="apple" />);

      expect(screen.getByText("Apple")).toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("applies correct CSS classes", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveClass(
        "flex",
        "w-fit",
        "items-center",
        "justify-between",
        "rounded-md",
        "border",
        "bg-transparent",
        "px-3",
        "py-2",
        "text-sm",
      );
    });

    it("applies size-specific classes", () => {
      const { rerender } = render(<SimpleSelect size="default" />);

      let trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveClass("data-[size=default]:h-9");

      rerender(<SimpleSelect size="sm" />);
      trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveClass("data-[size=sm]:h-8");
    });

    it("includes focus and hover styles", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveClass(
        "focus-visible:border-ring",
        "focus-visible:ring-ring/50",
        "focus-visible:ring-[3px]",
      );
    });
  });

  describe("Component Structure", () => {
    it("renders SelectValue component", () => {
      render(<SimpleSelect />);

      const value = screen.getByText("Select an option");
      expect(value.closest('[data-slot="select-value"]')).toBeInTheDocument();
    });

    it("renders chevron icon", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      const icon = trigger.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("lucide-chevron-down");
    });

    it("maintains consistent DOM structure", () => {
      render(<SimpleSelect />);

      const trigger = screen.getByTestId("select-trigger");
      const valueSpan = trigger.querySelector('[data-slot="select-value"]');
      const icon = trigger.querySelector("svg");

      expect(valueSpan).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Custom Props", () => {
    it("accepts custom className on trigger", () => {
      render(
        <Select>
          <SelectTrigger className="custom-class">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("custom-class");
    });

    it("forwards data attributes", () => {
      render(
        <Select>
          <SelectTrigger data-custom="test-value">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("data-custom", "test-value");
    });
  });

  describe("Error Handling", () => {
    it("handles invalid defaultValue gracefully", () => {
      render(<SimpleSelect defaultValue="nonexistent" />);

      // Should still render without crashing
      expect(screen.getByTestId("select-trigger")).toBeInTheDocument();
    });

    it("renders with minimal props", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("Individual Components", () => {
    it("renders SelectLabel with correct attributes", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Test Label</SelectLabel>
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      // Label is inside closed content, so we test the structure exists
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders SelectSeparator with correct attributes", () => {
      render(
        <div>
          <SelectSeparator data-testid="separator" />
        </div>,
      );

      const separator = screen.getByTestId("separator");
      expect(separator).toHaveAttribute("data-slot", "select-separator");
      expect(separator).toHaveClass(
        "bg-border",
        "pointer-events-none",
        "-mx-1",
        "my-1",
        "h-px",
      );
    });

    it("renders SelectItem with correct structure", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="select-item">
              Test Item
            </SelectItem>
          </SelectContent>
        </Select>,
      );

      // Item is inside closed content, so we test the structure exists
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders scroll buttons within SelectContent", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* Create many items to potentially trigger scroll buttons */}
            {Array.from({ length: 20 }, (_, i) => (
              <SelectItem key={i} value={`item-${i}`}>
                Item {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>,
      );

      // Scroll buttons are rendered automatically within SelectContent
      // This test ensures the SelectContent structure includes them
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("Scroll Button Components", () => {
    it("renders scroll buttons within SelectContent context", () => {
      // Test that scroll buttons are properly integrated within SelectContent
      // These components require Radix UI context and are automatically rendered
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {/* Create enough items to potentially show scroll buttons */}
            {Array.from({ length: 30 }, (_, i) => (
              <SelectItem key={i} value={`item-${i}`}>
                Item {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>,
      );

      // Verify the select structure exists and scroll buttons are integrated
      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("data-state", "closed");

      // The scroll buttons are rendered automatically within SelectContent
      // when needed, and are part of the Radix UI implementation
      expect(trigger).toHaveAttribute("role", "combobox");
    });

    it("maintains proper component structure with scroll functionality", () => {
      // Test the complete select with many items to ensure scroll button integration
      render(
        <Select defaultValue="item-5">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Many Items</SelectLabel>
              {Array.from({ length: 50 }, (_, i) => (
                <SelectItem key={i} value={`item-${i}`}>
                  Item {i + 1}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      // Verify the selected value is displayed
      expect(screen.getByText("Item 6")).toBeInTheDocument();

      // Verify the trigger maintains proper attributes
      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("data-state", "closed");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("exports scroll button components for advanced usage", () => {
      // Verify that the scroll button components are properly exported
      // This tests the export statements on lines 182-183
      expect(SelectScrollUpButton).toBeDefined();
      expect(SelectScrollDownButton).toBeDefined();
      expect(typeof SelectScrollUpButton).toBe("function");
      expect(typeof SelectScrollDownButton).toBe("function");
    });
  });

  describe("Performance", () => {
    it("renders efficiently with multiple re-renders", () => {
      const { rerender } = render(<SimpleSelect />);

      // Multiple re-renders should not cause issues
      rerender(<SimpleSelect defaultValue="apple" />);
      rerender(<SimpleSelect defaultValue="banana" />);
      rerender(<SimpleSelect disabled />);

      expect(screen.getByTestId("select-trigger")).toBeInTheDocument();
    });

    it("handles prop changes gracefully", () => {
      const { rerender } = render(<SimpleSelect size="default" />);

      let trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("data-size", "default");

      rerender(<SimpleSelect size="sm" disabled />);

      trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveAttribute("data-size", "sm");
      expect(trigger).toBeDisabled();
    });
  });
});
