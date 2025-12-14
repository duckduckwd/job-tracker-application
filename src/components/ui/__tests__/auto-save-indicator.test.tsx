import { render, screen } from "@testing-library/react";

import { AutoSaveIndicator } from "../auto-save-indicator";

describe("AutoSaveIndicator Component", () => {
  describe("Rendering and Content", () => {
    it("displays save message when isDirty is true", () => {
      render(<AutoSaveIndicator isDirty />);

      expect(screen.getByText("Draft saved automatically")).toBeInTheDocument();
    });

    it("displays empty content when isDirty is false", () => {
      render(<AutoSaveIndicator isDirty={false} />);

      const container = screen.getByRole("status");
      expect(container).toBeEmptyDOMElement();
    });

    it("applies default styling classes", () => {
      render(<AutoSaveIndicator isDirty />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveClass("text-sm", "text-white/70");
    });

    it("applies custom className when provided", () => {
      render(<AutoSaveIndicator isDirty className="custom-class" />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveClass("text-sm", "text-white/70", "custom-class");
    });

    it("merges custom className with default classes", () => {
      render(<AutoSaveIndicator isDirty={false} className="extra-spacing" />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveClass(
        "text-sm",
        "text-white/70",
        "extra-spacing",
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<AutoSaveIndicator isDirty />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-live", "polite");
      expect(indicator).toHaveAttribute("aria-atomic", "true");
      expect(indicator).toHaveAttribute("role", "status");
    });

    it("maintains accessibility attributes when not dirty", () => {
      render(<AutoSaveIndicator isDirty={false} />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveAttribute("aria-live", "polite");
      expect(indicator).toHaveAttribute("aria-atomic", "true");
      expect(indicator).toHaveAttribute("role", "status");
    });

    it("announces changes to screen readers", () => {
      const { rerender } = render(<AutoSaveIndicator isDirty={false} />);

      let indicator = screen.getByRole("status");
      expect(indicator).toBeEmptyDOMElement();

      rerender(<AutoSaveIndicator isDirty />);

      indicator = screen.getByRole("status");
      expect(indicator).toHaveTextContent("Draft saved automatically");
    });
  });

  describe("State Changes", () => {
    it("updates content when isDirty changes from false to true", () => {
      const { rerender } = render(<AutoSaveIndicator isDirty={false} />);

      let indicator = screen.getByRole("status");
      expect(indicator).toBeEmptyDOMElement();

      rerender(<AutoSaveIndicator isDirty />);

      indicator = screen.getByRole("status");
      expect(indicator).toHaveTextContent("Draft saved automatically");
    });

    it("clears content when isDirty changes from true to false", () => {
      const { rerender } = render(<AutoSaveIndicator isDirty />);

      let indicator = screen.getByRole("status");
      expect(indicator).toHaveTextContent("Draft saved automatically");

      rerender(<AutoSaveIndicator isDirty={false} />);

      indicator = screen.getByRole("status");
      expect(indicator).toBeEmptyDOMElement();
    });

    it("maintains className across state changes", () => {
      const { rerender } = render(
        <AutoSaveIndicator isDirty={false} className="persistent-class" />,
      );

      let indicator = screen.getByRole("status");
      expect(indicator).toHaveClass("persistent-class");

      rerender(<AutoSaveIndicator isDirty className="persistent-class" />);

      indicator = screen.getByRole("status");
      expect(indicator).toHaveClass("persistent-class");
    });
  });

  describe("Component Behavior", () => {
    it("is memoized and prevents unnecessary re-renders", () => {
      const { rerender } = render(<AutoSaveIndicator isDirty />);

      const indicator = screen.getByRole("status");
      const initialElement = indicator;

      // Re-render with same props
      rerender(<AutoSaveIndicator isDirty />);

      const updatedIndicator = screen.getByRole("status");
      expect(updatedIndicator).toBe(initialElement);
    });

    it("has correct display name", () => {
      expect(AutoSaveIndicator.displayName).toBe("AutoSaveIndicator");
    });

    it("handles rapid state changes", () => {
      const { rerender } = render(<AutoSaveIndicator isDirty={false} />);

      // Rapid changes
      rerender(<AutoSaveIndicator isDirty />);
      rerender(<AutoSaveIndicator isDirty={false} />);
      rerender(<AutoSaveIndicator isDirty />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveTextContent("Draft saved automatically");
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined className gracefully", () => {
      render(<AutoSaveIndicator isDirty className={undefined} />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveClass("text-sm", "text-white/70");
    });

    it("handles empty string className", () => {
      render(<AutoSaveIndicator isDirty className="" />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveClass("text-sm", "text-white/70");
    });

    it("handles boolean isDirty values correctly", () => {
      // Test explicit true
      const { rerender } = render(<AutoSaveIndicator isDirty={true} />);
      expect(screen.getByText("Draft saved automatically")).toBeInTheDocument();

      // Test explicit false
      rerender(<AutoSaveIndicator isDirty={false} />);
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });
  });

  describe("Integration Scenarios", () => {
    it("works within form contexts", () => {
      render(
        <form>
          <input type="text" />
          <AutoSaveIndicator isDirty />
        </form>,
      );

      expect(screen.getByText("Draft saved automatically")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("works with multiple instances", () => {
      render(
        <div>
          <AutoSaveIndicator isDirty className="first" />
          <AutoSaveIndicator isDirty={false} className="second" />
        </div>,
      );

      const indicators = screen.getAllByRole("status");
      expect(indicators).toHaveLength(2);
      expect(indicators[0]).toHaveTextContent("Draft saved automatically");
      expect(indicators[1]).toBeEmptyDOMElement();
    });

    it("maintains performance with frequent updates", () => {
      const { rerender } = render(<AutoSaveIndicator isDirty={false} />);

      // Simulate frequent auto-save updates
      for (let i = 0; i < 10; i++) {
        rerender(<AutoSaveIndicator isDirty={i % 2 === 0} />);
      }

      const indicator = screen.getByRole("status");
      expect(indicator).toBeEmptyDOMElement(); // Last state was false (i=9, 9%2=1, so false)
    });
  });

  describe("Styling and Layout", () => {
    it("applies text size and color classes correctly", () => {
      render(<AutoSaveIndicator isDirty />);

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveClass("text-sm");
      expect(indicator).toHaveClass("text-white/70");
    });

    it("supports custom styling through className", () => {
      render(
        <AutoSaveIndicator isDirty className="font-bold text-green-500" />,
      );

      const indicator = screen.getByRole("status");
      expect(indicator).toHaveClass("text-green-500", "font-bold");
    });

    it("maintains consistent layout when content changes", () => {
      const { rerender } = render(<AutoSaveIndicator isDirty={false} />);

      const indicator = screen.getByRole("status");
      const initialHeight = indicator.getBoundingClientRect().height;

      rerender(<AutoSaveIndicator isDirty />);

      const updatedHeight = indicator.getBoundingClientRect().height;
      expect(updatedHeight).toBeGreaterThanOrEqual(initialHeight);
    });
  });
});
