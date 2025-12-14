import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SkipLinks } from "../skip-links";

describe("SkipLinks Component", () => {
  const mockLinks = [
    { href: "#main", label: "Skip to main content" },
    { href: "#navigation", label: "Skip to navigation" },
    { href: "#footer", label: "Skip to footer" },
  ];

  describe("Rendering and Structure", () => {
    it("renders all provided links", () => {
      render(<SkipLinks links={mockLinks} />);

      expect(screen.getByText("Skip to main content")).toBeInTheDocument();
      expect(screen.getByText("Skip to navigation")).toBeInTheDocument();
      expect(screen.getByText("Skip to footer")).toBeInTheDocument();
    });

    it("renders links with correct href attributes", () => {
      render(<SkipLinks links={mockLinks} />);

      const mainLink = screen.getByText("Skip to main content");
      const navLink = screen.getByText("Skip to navigation");
      const footerLink = screen.getByText("Skip to footer");

      expect(mainLink).toHaveAttribute("href", "#main");
      expect(navLink).toHaveAttribute("href", "#navigation");
      expect(footerLink).toHaveAttribute("href", "#footer");
    });

    it("has correct display name", () => {
      expect(SkipLinks.displayName).toBe("SkipLinks");
    });
  });

  describe("Accessibility", () => {
    it("is hidden by default with screen reader only class", () => {
      render(<SkipLinks links={mockLinks} />);

      const container = screen.getByText("Skip to main content").closest("div");
      expect(container).toHaveClass("sr-only");
    });

    it("becomes visible when focused", () => {
      render(<SkipLinks links={mockLinks} />);

      const container = screen.getByText("Skip to main content").closest("div");
      expect(container).toHaveClass(
        "focus-within:not-sr-only",
        "focus-within:absolute",
        "focus-within:top-4",
        "focus-within:left-4",
        "focus-within:z-50",
      );
    });

    it("links are focusable", async () => {
      const user = userEvent.setup();
      render(<SkipLinks links={mockLinks} />);

      const mainLink = screen.getByText("Skip to main content");

      await user.tab();
      expect(mainLink).toHaveFocus();
    });

    it("applies proper focus styles", () => {
      render(<SkipLinks links={mockLinks} />);

      const links = screen.getAllByRole("link");

      for (const link of links) {
        expect(link).toHaveClass(
          "focus:ring-2",
          "focus:ring-blue-500",
          "focus:outline-none",
        );
      }
    });
  });

  describe("Styling", () => {
    it("applies correct base styling to links", () => {
      render(<SkipLinks links={mockLinks} />);

      const links = screen.getAllByRole("link");

      for (const link of links) {
        expect(link).toHaveClass(
          "rounded",
          "bg-blue-600",
          "px-4",
          "py-2",
          "text-white",
          "underline",
        );
      }
    });

    it("applies margin to subsequent links", () => {
      render(<SkipLinks links={mockLinks} />);

      const links = screen.getAllByRole("link");

      // First link should not have margin
      expect(links[0]).not.toHaveClass("ml-2");

      // Subsequent links should have margin
      expect(links[1]).toHaveClass("ml-2");
      expect(links[2]).toHaveClass("ml-2");
    });

    it("positions container correctly when focused", () => {
      render(<SkipLinks links={mockLinks} />);

      const container = screen.getByText("Skip to main content").closest("div");
      expect(container).toHaveClass(
        "focus-within:absolute",
        "focus-within:top-4",
        "focus-within:left-4",
        "focus-within:z-50",
      );
    });
  });

  describe("Navigation Behavior", () => {
    it("handles keyboard navigation between links", async () => {
      const user = userEvent.setup();
      render(<SkipLinks links={mockLinks} />);

      const links = screen.getAllByRole("link");

      // Tab to first link
      await user.tab();
      expect(links[0]).toHaveFocus();

      // Tab to second link
      await user.tab();
      expect(links[1]).toHaveFocus();

      // Tab to third link
      await user.tab();
      expect(links[2]).toHaveFocus();
    });

    it("handles click events", async () => {
      const user = userEvent.setup();
      render(<SkipLinks links={mockLinks} />);

      const mainLink = screen.getByText("Skip to main content");

      // Should not throw error when clicked
      await user.click(mainLink);
      expect(mainLink).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty links array", () => {
      render(<SkipLinks links={[]} />);

      const container = document.querySelector(".sr-only");
      expect(container).toBeInTheDocument();
      expect(container?.children).toHaveLength(0);
    });

    it("handles single link", () => {
      const singleLink = [{ href: "#main", label: "Skip to main" }];
      render(<SkipLinks links={singleLink} />);

      const link = screen.getByText("Skip to main");
      expect(link).toBeInTheDocument();
      expect(link).not.toHaveClass("ml-2");
    });

    it("handles links with special characters", () => {
      const specialLinks = [
        { href: "#main-content", label: "Skip to main content" },
        { href: "#nav_menu", label: "Skip to navigation menu" },
        { href: "#footer.section", label: "Skip to footer section" },
      ];

      render(<SkipLinks links={specialLinks} />);

      expect(screen.getByText("Skip to main content")).toHaveAttribute(
        "href",
        "#main-content",
      );
      expect(screen.getByText("Skip to navigation menu")).toHaveAttribute(
        "href",
        "#nav_menu",
      );
      expect(screen.getByText("Skip to footer section")).toHaveAttribute(
        "href",
        "#footer.section",
      );
    });

    it("handles long link labels", () => {
      const longLinks = [
        {
          href: "#main",
          label:
            "Skip to the main content area of the page where the primary information is displayed",
        },
      ];

      render(<SkipLinks links={longLinks} />);

      const link = screen.getByText(
        "Skip to the main content area of the page where the primary information is displayed",
      );
      expect(link).toBeInTheDocument();
    });
  });

  describe("Component Behavior", () => {
    it("is memoized for performance", () => {
      const { rerender } = render(<SkipLinks links={mockLinks} />);

      const container = screen.getByText("Skip to main content").closest("div");
      const initialElement = container;

      // Re-render with same props
      rerender(<SkipLinks links={mockLinks} />);

      const updatedContainer = screen
        .getByText("Skip to main content")
        .closest("div");
      expect(updatedContainer).toBe(initialElement);
    });

    it("re-renders when links change", () => {
      const initialLinks = [{ href: "#main", label: "Skip to main" }];
      const updatedLinks = [{ href: "#content", label: "Skip to content" }];

      const { rerender } = render(<SkipLinks links={initialLinks} />);

      expect(screen.getByText("Skip to main")).toBeInTheDocument();

      rerender(<SkipLinks links={updatedLinks} />);

      expect(screen.getByText("Skip to content")).toBeInTheDocument();
      expect(screen.queryByText("Skip to main")).not.toBeInTheDocument();
    });
  });

  describe("Real-world Usage", () => {
    it("works with typical page structure links", () => {
      const typicalLinks = [
        { href: "#main-content", label: "Skip to main content" },
        { href: "#primary-navigation", label: "Skip to primary navigation" },
        { href: "#search", label: "Skip to search" },
        { href: "#footer", label: "Skip to footer" },
      ];

      render(<SkipLinks links={typicalLinks} />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(4);

      expect(links[0]).toHaveAttribute("href", "#main-content");
      expect(links[1]).toHaveAttribute("href", "#primary-navigation");
      expect(links[2]).toHaveAttribute("href", "#search");
      expect(links[3]).toHaveAttribute("href", "#footer");
    });

    it("maintains proper tab order", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <SkipLinks links={mockLinks} />
          <button>Other focusable element</button>
        </div>,
      );

      // Tab through skip links first
      await user.tab();
      expect(screen.getByText("Skip to main content")).toHaveFocus();

      await user.tab();
      expect(screen.getByText("Skip to navigation")).toHaveFocus();

      await user.tab();
      expect(screen.getByText("Skip to footer")).toHaveFocus();

      // Then to other elements
      await user.tab();
      expect(screen.getByText("Other focusable element")).toHaveFocus();
    });
  });

  describe("Performance", () => {
    it("handles large number of links efficiently", () => {
      const manyLinks = Array.from({ length: 20 }, (_, i) => ({
        href: `#section-${i}`,
        label: `Skip to section ${i + 1}`,
      }));

      render(<SkipLinks links={manyLinks} />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(20);

      // Check first and last links
      expect(links[0]).toHaveAttribute("href", "#section-0");
      expect(links[19]).toHaveAttribute("href", "#section-19");
    });
  });
});
