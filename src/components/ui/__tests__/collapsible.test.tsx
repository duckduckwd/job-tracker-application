import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";

// Test component wrapper
const TestCollapsible = ({
  defaultOpen = false,
  onOpenChange = jest.fn(),
  disabled = false,
}) => (
  <Collapsible
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    disabled={disabled}
  >
    <CollapsibleTrigger data-testid="collapsible-trigger">
      Toggle Content
    </CollapsibleTrigger>
    <CollapsibleContent data-testid="collapsible-content">
      <div>Hidden content that can be toggled</div>
      <p>More content here</p>
    </CollapsibleContent>
  </Collapsible>
);

describe("Collapsible Component", () => {
  describe("Rendering and Structure", () => {
    it("renders with correct data attributes", () => {
      render(<TestCollapsible />);

      const root = screen
        .getByTestId("collapsible-trigger")
        .closest('[data-slot="collapsible"]');
      const trigger = screen.getByTestId("collapsible-trigger");
      const content = screen.getByTestId("collapsible-content");

      expect(root).toHaveAttribute("data-slot", "collapsible");
      expect(trigger).toHaveAttribute("data-slot", "collapsible-trigger");
      expect(content).toHaveAttribute("data-slot", "collapsible-content");
    });

    it("renders trigger button with correct text", () => {
      render(<TestCollapsible />);

      expect(screen.getByText("Toggle Content")).toBeInTheDocument();
    });

    it("starts closed by default", () => {
      render(<TestCollapsible />);

      const trigger = screen.getByTestId("collapsible-trigger");
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("starts open when defaultOpen is true", () => {
      render(<TestCollapsible defaultOpen />);

      const trigger = screen.getByTestId("collapsible-trigger");
      expect(trigger).toHaveAttribute("data-state", "open");
    });
  });

  describe("User Interactions", () => {
    it("toggles content when trigger is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      render(<TestCollapsible onOpenChange={onOpenChange} />);

      const trigger = screen.getByTestId("collapsible-trigger");

      // Initially closed
      expect(trigger).toHaveAttribute("data-state", "closed");

      // Click to open
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(trigger).toHaveAttribute("data-state", "open");

      // Click to close
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("shows and hides content based on state", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      const trigger = screen.getByTestId("collapsible-trigger");
      const content = screen.getByTestId("collapsible-content");

      // Initially hidden
      expect(content).toHaveAttribute("data-state", "closed");

      // Click to show
      await user.click(trigger);

      expect(content).toHaveAttribute("data-state", "open");
      expect(
        screen.getByText("Hidden content that can be toggled"),
      ).toBeInTheDocument();
      expect(screen.getByText("More content here")).toBeInTheDocument();
    });

    it("handles keyboard interactions", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      render(<TestCollapsible onOpenChange={onOpenChange} />);

      const trigger = screen.getByTestId("collapsible-trigger");
      trigger.focus();

      // Enter key should toggle
      await user.keyboard("{Enter}");
      expect(onOpenChange).toHaveBeenCalledWith(true);

      // Space key should toggle
      await user.keyboard(" ");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("prevents interaction when disabled", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      render(<TestCollapsible disabled onOpenChange={onOpenChange} />);

      const trigger = screen.getByTestId("collapsible-trigger");

      await user.click(trigger);

      // Should not call onOpenChange when disabled
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(trigger).toHaveAttribute("data-state", "closed");
    });
  });

  describe("Controlled vs Uncontrolled", () => {
    it("works as uncontrolled component", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      const trigger = screen.getByTestId("collapsible-trigger");

      // Should manage its own state
      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "open");

      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("works as controlled component", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();

      const ControlledCollapsible = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <Collapsible
            open={open}
            onOpenChange={(newOpen) => {
              setOpen(newOpen);
              onOpenChange(newOpen);
            }}
          >
            <CollapsibleTrigger data-testid="controlled-trigger">
              Controlled Toggle
            </CollapsibleTrigger>
            <CollapsibleContent data-testid="controlled-content">
              Controlled content
            </CollapsibleContent>
          </Collapsible>
        );
      };

      render(<ControlledCollapsible />);

      const trigger = screen.getByTestId("controlled-trigger");

      await user.click(trigger);
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<TestCollapsible />);

      const trigger = screen.getByTestId("collapsible-trigger");

      expect(trigger).toHaveAttribute("type", "button");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls");
    });

    it("updates aria-expanded when state changes", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      const trigger = screen.getByTestId("collapsible-trigger");

      // Initially collapsed
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      // Click to expand
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // Click to collapse
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("is focusable and keyboard accessible", () => {
      render(<TestCollapsible />);

      const trigger = screen.getByTestId("collapsible-trigger");

      trigger.focus();
      expect(trigger).toHaveFocus();
      // Button elements are focusable by default, no tabindex needed
      expect(trigger).toHaveAttribute("type", "button");
    });

    it("maintains proper focus management", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      const trigger = screen.getByTestId("collapsible-trigger");

      trigger.focus();
      await user.keyboard("{Enter}");

      // Focus should remain on trigger after activation
      expect(trigger).toHaveFocus();
    });
  });

  describe("Content Behavior", () => {
    it("preserves content when collapsed", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible defaultOpen />);

      const trigger = screen.getByTestId("collapsible-trigger");

      // Content should be visible initially
      expect(
        screen.getByText("Hidden content that can be toggled"),
      ).toBeInTheDocument();

      // Collapse
      await user.click(trigger);

      // Content should still exist in DOM but be hidden
      const content = screen.getByTestId("collapsible-content");
      expect(content).toHaveAttribute("data-state", "closed");
    });

    it("handles dynamic content changes", async () => {
      const user = userEvent.setup();

      const DynamicCollapsible = () => {
        const [items, setItems] = React.useState(["Item 1"]);

        return (
          <Collapsible defaultOpen>
            <CollapsibleTrigger data-testid="dynamic-trigger">
              Toggle ({items.length} items)
            </CollapsibleTrigger>
            <CollapsibleContent>
              {items.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
              <button
                onClick={() => setItems([...items, `Item ${items.length + 1}`])}
                data-testid="add-item"
              >
                Add Item
              </button>
            </CollapsibleContent>
          </Collapsible>
        );
      };

      render(<DynamicCollapsible />);

      // Add item
      await user.click(screen.getByTestId("add-item"));

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Toggle (2 items)")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles missing onOpenChange gracefully", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible onOpenChange={undefined} />);

      const trigger = screen.getByTestId("collapsible-trigger");

      // Should not crash when clicking
      await user.click(trigger);

      expect(trigger).toBeInTheDocument();
    });

    it("handles invalid defaultOpen values", () => {
      // @ts-expect-error - Testing invalid prop
      render(<TestCollapsible defaultOpen="invalid" />);

      const trigger = screen.getByTestId("collapsible-trigger");

      // Radix treats truthy strings as true, so it opens
      expect(trigger).toHaveAttribute("data-state", "open");
    });
  });

  describe("Custom Props and Styling", () => {
    it("forwards custom props to root element", () => {
      render(
        <Collapsible data-custom="test" className="custom-class">
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      const root = screen
        .getByText("Trigger")
        .closest('[data-slot="collapsible"]');
      expect(root).toHaveAttribute("data-custom", "test");
      expect(root).toHaveClass("custom-class");
    });

    it("forwards custom props to trigger", () => {
      render(
        <Collapsible>
          <CollapsibleTrigger className="trigger-class" data-custom="trigger">
            Custom Trigger
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByText("Custom Trigger");
      expect(trigger).toHaveClass("trigger-class");
      expect(trigger).toHaveAttribute("data-custom", "trigger");
    });

    it("forwards custom props to content", () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent className="content-class" data-custom="content">
            Custom Content
          </CollapsibleContent>
        </Collapsible>,
      );

      const content = screen
        .getByText("Custom Content")
        .closest('[data-slot="collapsible-content"]');
      expect(content).toHaveClass("content-class");
      expect(content).toHaveAttribute("data-custom", "content");
    });
  });
});
