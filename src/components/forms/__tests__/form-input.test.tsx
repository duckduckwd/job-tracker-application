import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { FormInput } from "../form-input";

const TestWrapper = ({ error, ...props }: any) => {
  const { register } = useForm();
  return <FormInput register={register} error={error} {...props} />;
};

describe("FormInput", () => {
  const defaultProps = {
    label: "Test Label",
    id: "testField" as const,
    placeholder: "Test placeholder",
  };

  it("renders label and input correctly", () => {
    render(<TestWrapper {...defaultProps} />);

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test placeholder")).toBeInTheDocument();
  });

  it("uses label as placeholder when no placeholder provided", () => {
    render(<TestWrapper label="Email" id="email" />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("displays error message when error exists", () => {
    const error = { message: "This field is required" };
    render(<TestWrapper {...defaultProps} error={error} />);

    expect(screen.getByText("* This field is required")).toBeInTheDocument();
    expect(screen.getByText("* This field is required")).toHaveClass(
      "text-destructive",
    );
  });

  it("sets aria-invalid when error exists", () => {
    const error = { message: "Invalid input" };
    render(<TestWrapper {...defaultProps} error={error} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("sets aria-describedby when error exists", () => {
    const error = { message: "Invalid input" };
    render(<TestWrapper {...defaultProps} error={error} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("aria-describedby", "testField-error");

    const errorElement = screen.getByText("* Invalid input");
    expect(errorElement).toHaveAttribute("id", "testField-error");
  });

  it("does not set aria attributes when no error", () => {
    render(<TestWrapper {...defaultProps} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<TestWrapper {...defaultProps} />);

    const input = screen.getByLabelText("Test Label");
    await user.type(input, "test value");

    expect(input).toHaveValue("test value");
  });

  it("forwards additional props to Input component", () => {
    render(<TestWrapper {...defaultProps} disabled />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toBeDisabled();
  });

  it("handles different input types", () => {
    render(<TestWrapper {...defaultProps} type="email" />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("type", "email");
  });

  it("maintains proper label-input association", () => {
    render(<TestWrapper {...defaultProps} />);

    const label = screen.getByText("Test Label");
    const input = screen.getByLabelText("Test Label");

    expect(label).toHaveAttribute("for", "testField");
    expect(input).toHaveAttribute("id", "testField");
  });

  it("handles complex error objects", () => {
    const error = {
      message: "Complex error",
      type: "validation",
      ref: {} as any,
    };
    render(<TestWrapper {...defaultProps} error={error} />);

    expect(screen.getByText("* Complex error")).toBeInTheDocument();
  });

  it("renders without error when error is undefined", () => {
    render(<TestWrapper {...defaultProps} error={undefined} />);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Test Label")).not.toHaveAttribute(
      "aria-invalid",
    );
  });
});
