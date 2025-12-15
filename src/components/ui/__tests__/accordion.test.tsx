import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";

describe("Accordion Component", () => {
  const defaultContent = <div>Test content</div>;

  describe("Single Type Accordion", () => {
    it("renders single accordion correctly", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("toggles single item on click", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");

      expect(trigger).toHaveAttribute("data-state", "closed");

      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "open");
      expect(screen.getByText("Test content")).toBeInTheDocument();

      await user.click(trigger);
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("respects defaultValue", () => {
      render(
        <Accordion type="single" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("data-state", "open");
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
  });

  describe("Multiple Type Accordion", () => {
    it("allows multiple items to be open", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const triggers = screen.getAllByRole("button");

      await user.click(triggers[0]!);
      await user.click(triggers[1]!);

      expect(triggers[0]).toHaveAttribute("data-state", "open");
      expect(triggers[1]).toHaveAttribute("data-state", "open");
      expect(screen.getByText("Content 1")).toBeInTheDocument();
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });
  });

  describe("AccordionTrigger", () => {
    it("has proper accessibility attributes", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger Text</AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("type", "button");
    });

    it("updates aria-expanded when toggled", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger Text</AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");

      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("handles keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger Text</AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      trigger.focus();

      expect(trigger).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(trigger).toHaveAttribute("data-state", "open");

      await user.keyboard(" ");
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("applies custom className", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="custom-trigger">
              Trigger Text
            </AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveClass("custom-trigger");
    });
  });

  describe("AccordionContent", () => {
    it("shows content when expanded", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Hidden content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(screen.getByText("Hidden content")).toBeInTheDocument();
    });

    it("applies custom className", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent className="custom-content">
              Content
            </AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const content = screen.getByText("Content").closest(".custom-content");
      expect(content).toHaveClass("custom-content");
    });
  });

  describe("AccordionItem", () => {
    it("applies custom className", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="custom-item">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const item = screen.getByText("Trigger").closest(".custom-item");
      expect(item).toHaveClass("custom-item", "border-b", "last:border-b-0");
    });
  });

  describe("Callbacks", () => {
    it("calls onValueChange for single type", async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();

      render(
        <Accordion type="single" collapsible onValueChange={onValueChange}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>{defaultContent}</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(onValueChange).toHaveBeenCalledWith("item-1");
    });

    it("calls onValueChange for multiple type", async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();

      render(
        <Accordion type="multiple" onValueChange={onValueChange}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const triggers = screen.getAllByRole("button");
      await user.click(triggers[0]!);

      expect(onValueChange).toHaveBeenCalledWith(["item-1"]);
    });
  });
});
