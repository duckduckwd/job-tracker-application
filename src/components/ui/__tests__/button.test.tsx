import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Button } from "../button";

describe("Button Component", () => {
  describe("Rendering and Structure", () => {
    it("renders with correct data attribute", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-slot", "button");
    });

    it("renders button text correctly", () => {
      render(<Button>Test Button</Button>);

      expect(screen.getByText("Test Button")).toBeInTheDocument();
    });

    it("renders as button element by default", () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole("button");
      expect(button.tagName).toBe("BUTTON");
    });
  });

  describe("Variants", () => {
    it("applies default variant styling", () => {
      render(<Button>Default</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("applies destructive variant styling", () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive", "text-white");
    });

    it("applies outline variant styling", () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "bg-background", "shadow-xs");
    });

    it("applies secondary variant styling", () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("applies ghost variant styling", () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "hover:bg-accent",
        "hover:text-accent-foreground",
      );
    });

    it("applies link variant styling", () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "text-primary",
        "underline-offset-4",
        "hover:underline",
      );
    });
  });

  describe("Sizes", () => {
    it("applies default size styling", () => {
      render(<Button>Default Size</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9", "px-4", "py-2");
    });

    it("applies small size styling", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8", "px-3");
    });

    it("applies large size styling", () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10", "px-6");
    });

    it("applies icon size styling", () => {
      render(<Button size="icon">🔥</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-9");
    });
  });

  describe("User Interactions", () => {
    it("handles click events", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<Button onClick={onClick}>Click me</Button>);

      await user.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("handles keyboard interactions", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<Button onClick={onClick}>Press me</Button>);

      const button = screen.getByRole("button");
      button.focus();

      await user.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.keyboard(" ");
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("prevents interaction when disabled", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <Button onClick={onClick} disabled>
          Disabled
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("is focusable by default", () => {
      render(<Button>Focusable</Button>);

      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    it("applies disabled styling and behavior", () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass(
        "disabled:pointer-events-none",
        "disabled:opacity-50",
      );
    });

    it("supports aria attributes", () => {
      render(<Button aria-label="Custom label">Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Custom label");
    });
  });

  describe("Custom Props", () => {
    it("accepts custom className", () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("forwards HTML button props", () => {
      render(
        <Button type="submit" form="test-form">
          Submit
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("form", "test-form");
    });

    it("supports data attributes", () => {
      render(<Button data-testid="test-button">Test</Button>);

      const button = screen.getByTestId("test-button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("AsChild Prop", () => {
    it("renders as child component when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/test");
      expect(link).toHaveAttribute("data-slot", "button");
      expect(link).toHaveClass("inline-flex", "items-center", "justify-center");
    });
  });

  describe("Focus and States", () => {
    it("applies focus-visible styles", () => {
      render(<Button>Focus Test</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "focus-visible:border-ring",
        "focus-visible:ring-ring/50",
      );
    });

    it("applies hover styles", () => {
      render(<Button>Hover Test</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-primary/90");
    });

    it("applies transition classes", () => {
      render(<Button>Transition Test</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-all");
    });
  });

  describe("Content and Layout", () => {
    it("handles icon content", () => {
      render(<Button>🔥 Fire</Button>);

      expect(screen.getByText("🔥 Fire")).toBeInTheDocument();
    });

    it("applies gap for content spacing", () => {
      render(<Button>Icon Text</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("gap-2");
    });

    it("handles whitespace correctly", () => {
      render(<Button>Multi Word Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("whitespace-nowrap");
    });
  });
});
