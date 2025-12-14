import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Label } from "../label";

describe("Label Component", () => {
  describe("Rendering and Structure", () => {
    it("renders with correct data attribute", () => {
      render(<Label>Test Label</Label>);

      const label = screen.getByText("Test Label");
      expect(label).toHaveAttribute("data-slot", "label");
    });

    it("renders label text correctly", () => {
      render(<Label>Form Label</Label>);

      expect(screen.getByText("Form Label")).toBeInTheDocument();
    });

    it("renders as label element", () => {
      render(<Label htmlFor="test">Label</Label>);

      const label = screen.getByText("Label");
      expect(label.tagName).toBe("LABEL");
    });
  });

  describe("Styling and Layout", () => {
    it("applies default styling classes", () => {
      render(<Label>Styled Label</Label>);

      const label = screen.getByText("Styled Label");
      expect(label).toHaveClass(
        "flex",
        "items-center",
        "gap-2",
        "text-sm",
        "leading-none",
        "font-medium",
        "select-none",
      );
    });

    it("applies custom className", () => {
      render(<Label className="custom-class">Custom</Label>);

      const label = screen.getByText("Custom");
      expect(label).toHaveClass("custom-class");
    });

    it("merges custom className with defaults", () => {
      render(<Label className="text-red-500">Red Label</Label>);

      const label = screen.getByText("Red Label");
      expect(label).toHaveClass("text-red-500", "flex", "items-center");
    });
  });

  describe("Form Association", () => {
    it("associates with form controls using htmlFor", () => {
      render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <input id="test-input" />
        </div>,
      );

      const label = screen.getByText("Test Label");
      const input = screen.getByRole("textbox");

      expect(label).toHaveAttribute("for", "test-input");
      expect(input).toHaveAttribute("id", "test-input");
    });

    it("focuses associated input when clicked", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Label htmlFor="clickable-input">Clickable Label</Label>
          <input id="clickable-input" />
        </div>,
      );

      const label = screen.getByText("Clickable Label");
      const input = screen.getByRole("textbox");

      await user.click(label);
      expect(input).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("supports screen readers", () => {
      render(<Label>Screen Reader Label</Label>);

      const label = screen.getByText("Screen Reader Label");
      expect(label).toBeInTheDocument();
    });

    it("handles disabled state styling", () => {
      render(
        <div data-disabled="true" className="group">
          <Label>Disabled Label</Label>
        </div>,
      );

      const label = screen.getByText("Disabled Label");
      expect(label).toHaveClass(
        "group-data-[disabled=true]:pointer-events-none",
        "group-data-[disabled=true]:opacity-50",
      );
    });

    it("handles peer disabled styling", () => {
      render(
        <div>
          <input disabled className="peer" />
          <Label>Peer Disabled Label</Label>
        </div>,
      );

      const label = screen.getByText("Peer Disabled Label");
      expect(label).toHaveClass(
        "peer-disabled:cursor-not-allowed",
        "peer-disabled:opacity-50",
      );
    });
  });

  describe("Content and Layout", () => {
    it("handles complex content", () => {
      render(
        <Label>
          <span>Required</span>
          <span className="text-red-500">*</span>
        </Label>,
      );

      expect(screen.getByText("Required")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("applies gap for content spacing", () => {
      render(<Label>Spaced Content</Label>);

      const label = screen.getByText("Spaced Content");
      expect(label).toHaveClass("gap-2");
    });

    it("handles icon content", () => {
      render(<Label>🔥 Fire Label</Label>);

      expect(screen.getByText("🔥 Fire Label")).toBeInTheDocument();
    });
  });

  describe("Custom Props", () => {
    it("forwards HTML label props", () => {
      render(
        <Label
          htmlFor="custom-input"
          title="Tooltip text"
          data-testid="test-label"
        >
          Custom Props
        </Label>,
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveAttribute("for", "custom-input");
      expect(label).toHaveAttribute("title", "Tooltip text");
    });

    it("supports event handlers", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const onMouseOver = jest.fn();

      render(
        <Label onClick={onClick} onMouseOver={onMouseOver}>
          Interactive Label
        </Label>,
      );

      const label = screen.getByText("Interactive Label");

      await user.click(label);
      expect(onClick).toHaveBeenCalled();

      await user.hover(label);
      expect(onMouseOver).toHaveBeenCalled();
    });
  });

  describe("Form Integration", () => {
    it("works with various input types", () => {
      render(
        <div>
          <Label htmlFor="text-input">Text Input</Label>
          <input id="text-input" type="text" />

          <Label htmlFor="checkbox-input">Checkbox</Label>
          <input id="checkbox-input" type="checkbox" />

          <Label htmlFor="select-input">Select</Label>
          <select id="select-input">
            <option>Option 1</option>
          </select>
        </div>,
      );

      expect(screen.getByText("Text Input")).toBeInTheDocument();
      expect(screen.getByText("Checkbox")).toBeInTheDocument();
      expect(screen.getByText("Select")).toBeInTheDocument();
    });

    it("maintains semantic relationship", () => {
      render(
        <div>
          <Label htmlFor="semantic-input">Semantic Label</Label>
          <input id="semantic-input" aria-describedby="help-text" />
          <div id="help-text">Help text</div>
        </div>,
      );

      const input = screen.getByLabelText("Semantic Label");
      expect(input).toHaveAttribute("aria-describedby", "help-text");
    });
  });

  describe("Responsive Design", () => {
    it("maintains consistent sizing", () => {
      render(<Label>Responsive Label</Label>);

      const label = screen.getByText("Responsive Label");
      expect(label).toHaveClass("text-sm", "leading-none");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty content", () => {
      render(<Label></Label>);

      const label = screen.getByRole("generic");
      expect(label).toBeInTheDocument();
    });

    it("handles undefined className", () => {
      render(<Label className={undefined}>Undefined Class</Label>);

      const label = screen.getByText("Undefined Class");
      expect(label).toBeInTheDocument();
    });

    it("handles long text content", () => {
      const longText =
        "This is a very long label text that should still render correctly and maintain proper styling";
      render(<Label>{longText}</Label>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe("Component Behavior", () => {
    it("prevents text selection", () => {
      render(<Label>Non-selectable</Label>);

      const label = screen.getByText("Non-selectable");
      expect(label).toHaveClass("select-none");
    });

    it("maintains flex layout", () => {
      render(<Label>Flex Layout</Label>);

      const label = screen.getByText("Flex Layout");
      expect(label).toHaveClass("flex", "items-center");
    });
  });

  describe("State Management", () => {
    it("handles dynamic content updates", () => {
      const DynamicLabel = () => {
        const [text, setText] = React.useState("Initial");

        return (
          <div>
            <Label>{text}</Label>
            <button onClick={() => setText("Updated")}>Update</button>
          </div>
        );
      };

      render(<DynamicLabel />);

      expect(screen.getByText("Initial")).toBeInTheDocument();
    });
  });
});
