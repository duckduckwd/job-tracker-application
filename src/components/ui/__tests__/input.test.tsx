import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Input } from "../input";

describe("Input Component", () => {
  describe("Rendering and Structure", () => {
    it("renders with correct data attribute", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("data-slot", "input");
    });

    it("renders as input element", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input.tagName).toBe("INPUT");
    });

    it("renders as textbox by default", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input.tagName).toBe("INPUT");
    });
  });

  describe("Input Types", () => {
    it("renders with email type", () => {
      render(<Input type="email" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "email");
    });

    it("renders with password type", () => {
      render(<Input type="password" />);

      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("type", "password");
    });

    it("renders with number type", () => {
      render(<Input type="number" />);

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("type", "number");
    });

    it("renders with file type", () => {
      const { container } = render(<Input type="file" />);

      const input = container.querySelector('input[type="file"]');
      expect(input).toHaveAttribute("type", "file");
    });
  });

  describe("User Interactions", () => {
    it("handles text input", async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello World");

      expect(input).toHaveValue("Hello World");
    });

    it("handles onChange events", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<Input onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      expect(onChange).toHaveBeenCalled();
    });

    it("handles focus and blur events", async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();
      const onBlur = jest.fn();

      render(<Input onFocus={onFocus} onBlur={onBlur} />);

      const input = screen.getByRole("textbox");

      await user.click(input);
      expect(onFocus).toHaveBeenCalled();

      await user.tab();
      expect(onBlur).toHaveBeenCalled();
    });

    it("prevents interaction when disabled", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<Input disabled onChange={onChange} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();

      await user.type(input, "test");
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue("");
    });
  });

  describe("Styling and Layout", () => {
    it("applies default styling classes", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass(
        "h-9",
        "w-full",
        "min-w-0",
        "rounded-md",
        "border",
        "bg-transparent",
        "px-3",
        "py-1",
        "text-base",
      );
    });

    it("applies focus styles", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass(
        "focus-visible:border-ring",
        "focus-visible:ring-ring/50",
        "focus-visible:ring-[3px]",
      );
    });

    it("applies disabled styles", () => {
      render(<Input disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass(
        "disabled:pointer-events-none",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
      );
    });

    it("applies placeholder styles", () => {
      render(<Input placeholder="Enter text" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("placeholder:text-muted-foreground");
      expect(input).toHaveAttribute("placeholder", "Enter text");
    });
  });

  describe("Accessibility", () => {
    it("is focusable by default", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      input.focus();
      expect(input).toHaveFocus();
    });

    it("supports aria attributes", () => {
      render(<Input aria-label="Custom input" aria-describedby="help-text" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Custom input");
      expect(input).toHaveAttribute("aria-describedby", "help-text");
    });

    it("supports aria-invalid styling", () => {
      render(<Input aria-invalid />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass(
        "aria-invalid:ring-destructive/20",
        "aria-invalid:border-destructive",
      );
    });

    it("works with labels", () => {
      render(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" />
        </div>,
      );

      const input = screen.getByLabelText("Test Label");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Custom Props", () => {
    it("accepts custom className", () => {
      render(<Input className="custom-class" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });

    it("forwards HTML input props", () => {
      render(
        <Input name="test-input" required maxLength={10} autoComplete="off" />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("name", "test-input");
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("maxlength", "10");
      expect(input).toHaveAttribute("autocomplete", "off");
    });

    it("supports controlled input", async () => {
      const user = userEvent.setup();
      const ControlledInput = () => {
        const [value, setValue] = React.useState("");
        return (
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        );
      };

      render(<ControlledInput />);

      const input = screen.getByRole("textbox");
      await user.type(input, "controlled");

      expect(input).toHaveValue("controlled");
    });
  });

  describe("File Input Specific", () => {
    it("applies file input styles", () => {
      const { container } = render(<Input type="file" />);

      const input = container.querySelector('input[type="file"]');
      expect(input).toHaveClass(
        "file:inline-flex",
        "file:h-7",
        "file:border-0",
        "file:bg-transparent",
        "file:text-sm",
        "file:font-medium",
      );
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive text sizing", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("text-base", "md:text-sm");
    });
  });

  describe("Form Integration", () => {
    it("works within form context", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <form onSubmit={onSubmit}>
          <Input name="test" />
          <button type="submit">Submit</button>
        </form>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "form data");

      expect(input).toHaveValue("form data");
    });

    it("supports form validation", () => {
      render(<Input required pattern="[0-9]+" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("pattern", "[0-9]+");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty value", () => {
      render(<Input value="" readOnly />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("");
    });

    it("handles undefined className", () => {
      render(<Input className={undefined} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("handles readonly state", async () => {
      const user = userEvent.setup();
      render(<Input readOnly value="readonly" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("readonly");

      await user.type(input, "test");
      expect(input).toHaveValue("readonly");
    });
  });
});
