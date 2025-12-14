import { render, screen } from "@testing-library/react";
import React from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";

describe("Card Components", () => {
  describe("Card", () => {
    it("renders with correct data attribute", () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText("Card content");
      expect(card).toHaveAttribute("data-slot", "card");
    });

    it("applies default styling classes", () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText("Card content");
      expect(card).toHaveClass(
        "bg-card",
        "text-card-foreground",
        "flex",
        "flex-col",
        "gap-6",
        "border",
        "py-6",
        "shadow-sm",
      );
    });

    it("applies custom border radius style", () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText("Card content");
      expect(card).toHaveStyle({ borderRadius: "48px" });
    });

    it("accepts custom className", () => {
      render(<Card className="custom-class">Card content</Card>);

      const card = screen.getByText("Card content");
      expect(card).toHaveClass("custom-class");
    });

    it("forwards HTML div props", () => {
      render(
        <Card data-testid="test-card" id="my-card">
          Card content
        </Card>,
      );

      const card = screen.getByTestId("test-card");
      expect(card).toHaveAttribute("id", "my-card");
    });
  });

  describe("CardHeader", () => {
    it("renders with correct data attribute", () => {
      render(<CardHeader>Header content</CardHeader>);

      const header = screen.getByText("Header content");
      expect(header).toHaveAttribute("data-slot", "card-header");
    });

    it("applies default styling classes", () => {
      render(<CardHeader>Header content</CardHeader>);

      const header = screen.getByText("Header content");
      expect(header).toHaveClass(
        "@container/card-header",
        "grid",
        "auto-rows-min",
        "grid-rows-[auto_auto]",
        "items-start",
        "gap-2",
        "px-6",
      );
    });

    it("accepts custom className", () => {
      render(<CardHeader className="custom-header">Header</CardHeader>);

      const header = screen.getByText("Header");
      expect(header).toHaveClass("custom-header");
    });
  });

  describe("CardTitle", () => {
    it("renders with correct data attribute", () => {
      render(<CardTitle>Title text</CardTitle>);

      const title = screen.getByText("Title text");
      expect(title).toHaveAttribute("data-slot", "card-title");
    });

    it("applies default styling classes", () => {
      render(<CardTitle>Title text</CardTitle>);

      const title = screen.getByText("Title text");
      expect(title).toHaveClass("leading-none", "font-semibold");
    });

    it("accepts custom className", () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);

      const title = screen.getByText("Title");
      expect(title).toHaveClass("custom-title");
    });
  });

  describe("CardDescription", () => {
    it("renders with correct data attribute", () => {
      render(<CardDescription>Description text</CardDescription>);

      const description = screen.getByText("Description text");
      expect(description).toHaveAttribute("data-slot", "card-description");
    });

    it("applies default styling classes", () => {
      render(<CardDescription>Description text</CardDescription>);

      const description = screen.getByText("Description text");
      expect(description).toHaveClass("text-muted-foreground", "text-sm");
    });

    it("accepts custom className", () => {
      render(
        <CardDescription className="custom-desc">Description</CardDescription>,
      );

      const description = screen.getByText("Description");
      expect(description).toHaveClass("custom-desc");
    });
  });

  describe("CardAction", () => {
    it("renders with correct data attribute", () => {
      render(<CardAction>Action content</CardAction>);

      const action = screen.getByText("Action content");
      expect(action).toHaveAttribute("data-slot", "card-action");
    });

    it("applies default styling classes", () => {
      render(<CardAction>Action content</CardAction>);

      const action = screen.getByText("Action content");
      expect(action).toHaveClass(
        "col-start-2",
        "row-span-2",
        "row-start-1",
        "self-start",
        "justify-self-end",
      );
    });

    it("accepts custom className", () => {
      render(<CardAction className="custom-action">Action</CardAction>);

      const action = screen.getByText("Action");
      expect(action).toHaveClass("custom-action");
    });
  });

  describe("CardContent", () => {
    it("renders with correct data attribute", () => {
      render(<CardContent>Content text</CardContent>);

      const content = screen.getByText("Content text");
      expect(content).toHaveAttribute("data-slot", "card-content");
    });

    it("applies default styling classes", () => {
      render(<CardContent>Content text</CardContent>);

      const content = screen.getByText("Content text");
      expect(content).toHaveClass("px-6");
    });

    it("accepts custom className", () => {
      render(<CardContent className="custom-content">Content</CardContent>);

      const content = screen.getByText("Content");
      expect(content).toHaveClass("custom-content");
    });
  });

  describe("CardFooter", () => {
    it("renders with correct data attribute", () => {
      render(<CardFooter>Footer content</CardFooter>);

      const footer = screen.getByText("Footer content");
      expect(footer).toHaveAttribute("data-slot", "card-footer");
    });

    it("applies default styling classes", () => {
      render(<CardFooter>Footer content</CardFooter>);

      const footer = screen.getByText("Footer content");
      expect(footer).toHaveClass("flex", "items-center", "px-6");
    });

    it("accepts custom className", () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>);

      const footer = screen.getByText("Footer");
      expect(footer).toHaveClass("custom-footer");
    });
  });

  describe("Complete Card Structure", () => {
    it("renders full card with all components", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Main card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card description text")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(
        screen.getByText("Main card content goes here"),
      ).toBeInTheDocument();
      expect(screen.getByText("Footer Button")).toBeInTheDocument();
    });

    it("maintains proper component hierarchy", () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>
          <CardContent data-testid="content">Content</CardContent>
        </Card>,
      );

      const card = screen.getByTestId("card");
      const header = screen.getByTestId("header");
      const title = screen.getByTestId("title");
      const content = screen.getByTestId("content");

      expect(card).toContainElement(header);
      expect(header).toContainElement(title);
      expect(card).toContainElement(content);
    });
  });

  describe("Layout and Grid Behavior", () => {
    it("applies grid layout to header with action", () => {
      render(
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction>Action</CardAction>
        </CardHeader>,
      );

      const header = screen
        .getByText("Title")
        .closest('[data-slot="card-header"]');
      expect(header).toHaveClass(
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
      );
    });

    it("positions action correctly in grid", () => {
      render(
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction>Action</CardAction>
        </CardHeader>,
      );

      const action = screen.getByText("Action");
      expect(action).toHaveClass(
        "col-start-2",
        "row-span-2",
        "row-start-1",
        "self-start",
        "justify-self-end",
      );
    });
  });

  describe("Responsive Design", () => {
    it("applies container queries to header", () => {
      render(<CardHeader>Header</CardHeader>);

      const header = screen.getByText("Header");
      expect(header).toHaveClass("@container/card-header");
    });
  });

  describe("Border and Spacing", () => {
    it("handles border classes correctly", () => {
      render(
        <div>
          <CardHeader className="border-b">Header with border</CardHeader>
          <CardFooter className="border-t">Footer with border</CardFooter>
        </div>,
      );

      const header = screen.getByText("Header with border");
      const footer = screen.getByText("Footer with border");

      expect(header).toHaveClass("[.border-b]:pb-6");
      expect(footer).toHaveClass("[.border-t]:pt-6");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty components", () => {
      render(
        <Card data-testid="empty-card">
          <CardHeader></CardHeader>
          <CardContent></CardContent>
          <CardFooter></CardFooter>
        </Card>,
      );

      const card = screen.getByTestId("empty-card");
      expect(card).toBeInTheDocument();
    });

    it("handles components without content", () => {
      render(
        <Card data-testid="no-content-card">
          <CardTitle />
          <CardDescription />
          <CardAction />
        </Card>,
      );

      const card = screen.getByTestId("no-content-card");
      expect(card).toBeInTheDocument();
    });

    it("handles long content gracefully", () => {
      const longText =
        "This is a very long piece of text that should wrap properly within the card component and maintain good readability and layout structure";

      render(
        <Card>
          <CardTitle>{longText}</CardTitle>
          <CardDescription>{longText}</CardDescription>
          <CardContent>{longText}</CardContent>
        </Card>,
      );

      expect(screen.getAllByText(longText)).toHaveLength(3);
    });
  });

  describe("Accessibility", () => {
    it("maintains semantic structure", () => {
      render(
        <Card role="article">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Article Title
            </CardTitle>
            <CardDescription>Article description</CardDescription>
          </CardHeader>
          <CardContent>Article content</CardContent>
        </Card>,
      );

      const article = screen.getByRole("article");
      const heading = screen.getByRole("heading", { level: 2 });

      expect(article).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
    });

    it("supports ARIA attributes", () => {
      render(
        <Card
          aria-labelledby="card-title"
          aria-describedby="card-desc"
          data-testid="accessible-card"
        >
          <CardTitle id="card-title">Accessible Title</CardTitle>
          <CardDescription id="card-desc">
            Accessible description
          </CardDescription>
        </Card>,
      );

      const card = screen.getByTestId("accessible-card");
      expect(card).toHaveAttribute("aria-labelledby", "card-title");
      expect(card).toHaveAttribute("aria-describedby", "card-desc");
    });
  });

  describe("Performance", () => {
    it("handles multiple cards efficiently", () => {
      render(
        <div>
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={i} data-testid={`card-${i}`}>
              <CardTitle>Card {i + 1}</CardTitle>
            </Card>
          ))}
        </div>,
      );

      for (let i = 0; i < 5; i++) {
        expect(screen.getByTestId(`card-${i}`)).toBeInTheDocument();
        expect(screen.getByText(`Card ${i + 1}`)).toBeInTheDocument();
      }
    });
  });
});
