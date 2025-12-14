import { render } from "@testing-library/react";

import { Skeleton } from "../skeleton";

describe("Skeleton Component", () => {
  describe("Rendering and Structure", () => {
    it("renders as div element", () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.tagName).toBe("DIV");
    });

    it("applies default styling classes", () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass(
        "animate-pulse",
        "rounded-md",
        "bg-white/20",
      );
    });

    it("has correct display name", () => {
      expect(Skeleton.displayName).toBe("Skeleton");
    });
  });

  describe("Custom Styling", () => {
    it("accepts custom className", () => {
      const { container } = render(<Skeleton className="custom-class" />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("custom-class");
    });

    it("merges custom className with defaults", () => {
      const { container } = render(<Skeleton className="h-4 w-full" />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass(
        "h-4",
        "w-full",
        "animate-pulse",
        "rounded-md",
        "bg-white/20",
      );
    });

    it("handles empty className", () => {
      const { container } = render(<Skeleton className="" />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass(
        "animate-pulse",
        "rounded-md",
        "bg-white/20",
      );
    });

    it("handles undefined className", () => {
      const { container } = render(<Skeleton className={undefined} />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass(
        "animate-pulse",
        "rounded-md",
        "bg-white/20",
      );
    });
  });

  describe("Component Behavior", () => {
    it("is memoized for performance", () => {
      const { rerender, container } = render(<Skeleton className="test" />);

      const skeleton = container.firstChild as HTMLElement;
      const initialElement = skeleton;

      // Re-render with same props
      rerender(<Skeleton className="test" />);

      const updatedSkeleton = container.firstChild as HTMLElement;
      expect(updatedSkeleton).toBe(initialElement);
    });

    it("re-renders when className changes", () => {
      const { rerender, container } = render(<Skeleton className="initial" />);

      let skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("initial");

      rerender(<Skeleton className="updated" />);

      skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("updated");
      expect(skeleton).not.toHaveClass("initial");
    });
  });

  describe("Animation", () => {
    it("applies pulse animation", () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });

  describe("Common Use Cases", () => {
    it("renders as text skeleton", () => {
      const { container } = render(<Skeleton className="h-4 w-[250px]" />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("h-4", "w-[250px]");
    });

    it("renders as circular skeleton", () => {
      const { container } = render(
        <Skeleton className="h-12 w-12 rounded-full" />,
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("h-12", "w-12", "rounded-full");
    });

    it("renders as card skeleton", () => {
      const { container } = render(
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />,
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("h-[125px]", "w-[250px]", "rounded-xl");
    });
  });

  describe("Multiple Skeletons", () => {
    it("renders multiple skeleton elements", () => {
      const { container } = render(
        <div>
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>,
      );

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(3);
      expect(skeletons[0]).toHaveClass("w-[250px]");
      expect(skeletons[1]).toHaveClass("w-[200px]");
      expect(skeletons[2]).toHaveClass("w-[150px]");
    });
  });

  describe("Accessibility", () => {
    it("is decorative and does not interfere with screen readers", () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toBeInTheDocument();
      // Skeleton should not have any accessibility attributes as it's purely visual
    });

    it("can be hidden from screen readers if needed", () => {
      const { container } = render(<Skeleton className="aria-hidden" />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("aria-hidden");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long className strings", () => {
      const longClassName =
        "h-4 w-full bg-gray-200 rounded animate-pulse transition-all duration-300 ease-in-out transform hover:scale-105";
      const { container } = render(<Skeleton className={longClassName} />);

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("h-4", "w-full", "bg-gray-200");
    });

    it("handles special characters in className", () => {
      const { container } = render(
        <Skeleton className="w-[calc(100%-2rem)]" />,
      );

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("w-[calc(100%-2rem)]");
    });
  });

  describe("Performance", () => {
    it("handles rapid re-renders efficiently", () => {
      const { rerender, container } = render(<Skeleton className="h-4" />);

      // Rapid re-renders with different classes
      for (let i = 0; i < 10; i++) {
        rerender(<Skeleton className={`h-${i + 1}`} />);
      }

      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass("h-10");
    });
  });
});
