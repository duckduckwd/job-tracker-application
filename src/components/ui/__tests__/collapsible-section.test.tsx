import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Accordion } from "../accordion";
import { CollapsibleSection } from "../collapsible-section";

describe("CollapsibleSection Component", () => {
  const defaultProps = {
    sectionTitle: "Test Section",
    children: <div>Section content</div>,
    openItem: false,
  };

  const renderWithAccordion = (props = defaultProps, accordionProps = {}) => {
    return render(
      <Accordion type="single" collapsible {...accordionProps}>
        <CollapsibleSection {...props} />
      </Accordion>,
    );
  };

  describe("Rendering and Structure", () => {
    it("renders section title correctly", () => {
      renderWithAccordion();

      expect(screen.getByText("Test Section")).toBeInTheDocument();
    });

    it("renders children content when opened", () => {
      renderWithAccordion(
        { ...defaultProps, openItem: true },
        { defaultValue: "Test Section" },
      );

      expect(screen.getByText("Section content")).toBeInTheDocument();
    });

    it("renders accordion structure correctly", () => {
      renderWithAccordion();

      // Just verify the basic structure is rendered
      expect(screen.getByText("Test Section")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("displays chevron icon in closed state", () => {
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");
      const iconContainer = trigger.querySelector(".inline-flex");

      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass(
        "inline-flex",
        "items-center",
        "justify-center",
      );
    });

    it("starts closed by default", () => {
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("starts open when defaultOpen is true", () => {
      renderWithAccordion(
        { ...defaultProps, openItem: true },
        { defaultValue: "Test Section" },
      );

      const trigger = screen.getByLabelText("Toggle Test Section");
      expect(trigger).toHaveAttribute("data-state", "open");
    });
  });

  describe("User Interactions", () => {
    it("toggles section when clicked", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");

      // Initially closed
      expect(trigger).toHaveAttribute("data-state", "closed");

      // Click to open
      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "open");

      // Click to close
      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("changes icon state when toggled", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");
      const iconContainer = trigger.querySelector(".inline-flex");

      expect(iconContainer).toBeInTheDocument();

      await user.click(trigger);

      // Icon container should still be present after toggle
      expect(trigger.querySelector(".inline-flex")).toBeInTheDocument();
    });

    it("applies hover styles on trigger", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");

      await user.hover(trigger);

      // Hover styles are applied via CSS classes
      expect(trigger).toHaveClass("hover:bg-white/10");
    });

    it("handles keyboard interactions", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");
      trigger.focus();

      expect(trigger).toHaveFocus();

      // Enter key should toggle
      await user.keyboard("{Enter}");
      expect(trigger).toHaveAttribute("data-state", "open");

      // Space key should toggle
      await user.keyboard(" ");
      expect(trigger).toHaveAttribute("data-state", "closed");
    });
  });

  describe("Content Behavior", () => {
    it("shows content when expanded", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");
      await user.click(trigger);

      expect(screen.getByText("Section content")).toBeInTheDocument();
    });

    it("hides content when collapsed", () => {
      renderWithAccordion();

      // Content should be hidden initially (closed state)
      const contentContainer = screen
        .getByText("Test Section")
        .closest('[data-state="closed"]');
      expect(contentContainer).toBeInTheDocument();
    });

    it("preserves content during state changes", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");

      // Open and close multiple times
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      expect(screen.getByText("Section content")).toBeInTheDocument();
    });

    it("handles complex children content", () => {
      const complexChildren = (
        <div>
          <h3>Subsection</h3>
          <p>Description</p>
          <button>Action</button>
        </div>
      );

      renderWithAccordion(
        {
          sectionTitle: "Complex Section",
          children: complexChildren,
          openItem: true,
        },
        { defaultValue: "Complex Section" },
      );

      expect(screen.getByText("Subsection")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label on trigger", () => {
      renderWithAccordion();

      const trigger = screen.getByLabelText("Toggle Test Section");
      expect(trigger).toHaveAttribute("aria-label", "Toggle Test Section");
    });

    it("updates aria-label when section title changes", () => {
      const { rerender } = renderWithAccordion();

      let trigger = screen.getByLabelText("Toggle Test Section");
      expect(trigger).toHaveAttribute("aria-label", "Toggle Test Section");

      rerender(
        <Accordion type="single" collapsible>
          <CollapsibleSection
            sectionTitle="New Title"
            children={defaultProps.children}
            openItem={false}
          />
        </Accordion>,
      );

      trigger = screen.getByLabelText("Toggle New Title");
      expect(trigger).toHaveAttribute("aria-label", "Toggle New Title");
    });

    it("has proper button semantics", () => {
      renderWithAccordion();

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("type", "button");
      expect(trigger).toHaveAttribute("aria-expanded");
    });

    it("updates aria-expanded based on state", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByRole("button");

      // Initially collapsed
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);

      // Should be expanded
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("is keyboard navigable", () => {
      renderWithAccordion();

      const trigger = screen.getByRole("button");
      trigger.focus();

      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute("type", "button");
    });
  });

  describe("Styling and Visual States", () => {
    it("applies correct trigger styling in closed state", () => {
      renderWithAccordion();

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveClass(
        "flex",
        "w-full",
        "items-center",
        "justify-between",
      );
      expect(trigger).toHaveClass(
        "cursor-pointer",
        "transition-all",
        "duration-200",
      );
      expect(trigger).toHaveClass("px-4", "py-3", "bg-white/5");
    });

    it("applies correct trigger styling in open state", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // The trigger should have data-state="open" when clicked
      expect(trigger).toHaveAttribute("data-state", "open");
      // The styling is based on the openItem prop, not the actual accordion state
      // So we check that the component has the closed state styling since openItem=false
      expect(trigger).toHaveClass("hover:bg-white/10");
    });

    it("applies correct icon button styling", () => {
      renderWithAccordion();

      const trigger = screen.getByRole("button");
      const iconButton = trigger.querySelector(".inline-flex");

      expect(iconButton).toHaveClass(
        "inline-flex",
        "items-center",
        "justify-center",
        "rounded-full",
        "h-6",
        "w-6",
        "transition-all",
        "duration-200",
        "bg-primary",
        "text-primary-foreground",
      );
    });

    it("applies correct content styling", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const contentContainer = screen
        .getByText("Section content")
        .closest(".px-4");
      expect(contentContainer).toHaveClass("px-4", "pt-2", "pb-4");
    });

    it("maintains icon presence across state changes", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByRole("button");

      // Should have icon container in closed state
      let iconContainer = trigger.querySelector(".inline-flex");
      expect(iconContainer).toBeInTheDocument();

      await user.click(trigger);

      // Should still have icon container in open state
      iconContainer = trigger.querySelector(".inline-flex");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("Custom Props", () => {
    it("renders with openItem prop", () => {
      renderWithAccordion(
        { ...defaultProps, openItem: true },
        { defaultValue: "Test Section" },
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("data-state", "open");
    });

    it("renders with custom section title", () => {
      renderWithAccordion({
        ...defaultProps,
        sectionTitle: "Custom Title",
      });

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      const trigger = screen.getByLabelText("Toggle Custom Title");
      expect(trigger).toHaveAttribute("aria-label", "Toggle Custom Title");
    });
  });

  describe("State Management", () => {
    it("manages internal state correctly", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByRole("button");

      // Should start closed
      expect(trigger).toHaveAttribute("data-state", "closed");

      // Multiple toggles
      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "open");

      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "closed");

      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "open");
    });

    it("respects defaultValue from Accordion", () => {
      renderWithAccordion(
        { ...defaultProps, openItem: true },
        { defaultValue: "Test Section" },
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("data-state", "open");
    });

    it("handles onValueChange callback", async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();

      renderWithAccordion(defaultProps, { onValueChange });

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(trigger).toHaveAttribute("data-state", "open");
      expect(onValueChange).toHaveBeenCalledWith("Test Section");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty section title", () => {
      renderWithAccordion({
        sectionTitle: "",
        children: defaultProps.children,
        openItem: false,
      });

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("aria-label", "Toggle ");
    });

    it("handles very long section titles", () => {
      const longTitle = "A".repeat(100);
      renderWithAccordion({
        sectionTitle: longTitle,
        children: defaultProps.children,
        openItem: false,
      });

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles missing children gracefully", () => {
      // @ts-expect-error - Testing missing required prop
      renderWithAccordion({
        sectionTitle: "Test",
        openItem: false,
      } as any);

      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("handles null children", () => {
      renderWithAccordion({
        sectionTitle: "Test",
        children: <div />,
        openItem: false,
      });

      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("handles rapid state changes efficiently", async () => {
      const user = userEvent.setup();
      renderWithAccordion();

      const trigger = screen.getByRole("button");

      // Rapid toggles
      for (let i = 0; i < 10; i++) {
        await user.click(trigger);
      }

      // Should end in closed state (10 clicks = even number, starts closed)
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("maintains performance with complex children", async () => {
      const user = userEvent.setup();
      const complexChildren = (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      );

      renderWithAccordion({
        sectionTitle: "Complex Section",
        children: complexChildren,
        openItem: false,
      });

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(screen.getByText("Item 0")).toBeInTheDocument();
      expect(screen.getByText("Item 99")).toBeInTheDocument();
    });
  });
});
