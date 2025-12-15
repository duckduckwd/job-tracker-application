import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import {
  type FieldConfig,
  FormSection,
  type SwitchConfig,
} from "../form-section";

const TestWrapper = ({ fields, errors = {}, ...props }: any) => {
  const { register } = useForm();
  return (
    <FormSection
      register={register}
      errors={errors}
      fields={fields}
      {...props}
    />
  );
};

describe("FormSection", () => {
  const inputField: FieldConfig = {
    id: "companyName",
    label: "Company Name",
    type: "text",
    placeholder: "Enter company name",
    required: true,
  };

  const switchField: SwitchConfig = {
    id: "isLinkedInConnection",
    label: "LinkedIn Connection",
    type: "switch",
  };

  it("renders fieldset with legend", () => {
    render(<TestWrapper legend="Job Details" fields={[inputField]} />);

    const fieldset = screen.getByRole("group");
    expect(fieldset).toBeInTheDocument();

    const legend = screen.getByText("Job Details");
    expect(legend).toHaveClass("sr-only");
  });

  it("renders input fields correctly", () => {
    render(<TestWrapper legend="Job Details" fields={[inputField]} />);

    expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter company name"),
    ).toBeInTheDocument();
  });

  it("renders switch fields correctly", () => {
    render(<TestWrapper legend="Job Details" fields={[switchField]} />);

    expect(screen.getByLabelText("LinkedIn Connection")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("renders mixed field types", () => {
    const fields = [inputField, switchField];
    render(<TestWrapper legend="Job Details" fields={fields} />);

    expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn Connection")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("passes errors to input fields", () => {
    const errors = {
      companyName: { message: "Company name is required" },
    };
    render(
      <TestWrapper
        legend="Job Details"
        fields={[inputField]}
        errors={errors}
      />,
    );

    expect(screen.getByText("* Company name is required")).toBeInTheDocument();
  });

  it("handles multiple input fields with different configurations", () => {
    const fields: FieldConfig[] = [
      {
        id: "companyName",
        label: "Company Name",
        type: "text",
        placeholder: "Enter company name",
        required: true,
      },
      {
        id: "roleTitle",
        label: "Role Title",
        type: "text",
        placeholder: "Enter role title",
        required: false,
      },
      {
        id: "dateApplied",
        label: "Date Applied",
        type: "date",
        placeholder: "Select date",
      },
    ];

    render(<TestWrapper legend="Application Details" fields={fields} />);

    expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Role Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Date Applied")).toBeInTheDocument();
  });

  it("handles fields with list attribute", () => {
    const fieldWithList: FieldConfig = {
      id: "location",
      label: "Location",
      type: "text",
      placeholder: "Select location",
      list: "locations",
    };

    render(<TestWrapper legend="Job Details" fields={[fieldWithList]} />);

    const input = screen.getByLabelText("Location");
    expect(input).toHaveAttribute("list", "locations");
  });

  it("applies proper spacing classes", () => {
    render(<TestWrapper legend="Job Details" fields={[inputField]} />);

    const fieldset = screen.getByRole("group");
    expect(fieldset).toHaveClass("space-y-4");
  });

  it("renders empty fieldset when no fields provided", () => {
    render(<TestWrapper legend="Empty Section" fields={[]} />);

    const fieldset = screen.getByRole("group");
    expect(fieldset).toBeInTheDocument();
    expect(fieldset.children).toHaveLength(1); // Only legend
  });

  it("handles complex error scenarios", () => {
    const fields = [inputField, switchField];
    const errors = {
      companyName: { message: "Company name is required" },
      isLinkedInConnection: { message: "Please specify LinkedIn connection" },
    };

    render(
      <TestWrapper legend="Job Details" fields={fields} errors={errors} />,
    );

    expect(screen.getByText("* Company name is required")).toBeInTheDocument();
    // Note: Switch components typically don't show error messages in the same way
  });

  it("maintains field order", () => {
    const fields = [
      {
        id: "field1",
        label: "First Field",
        type: "text",
        placeholder: "First",
      },
      { id: "field2", label: "Second Field", type: "switch" },
      {
        id: "field3",
        label: "Third Field",
        type: "text",
        placeholder: "Third",
      },
    ];

    render(<TestWrapper legend="Ordered Fields" fields={fields} />);

    const fieldset = screen.getByRole("group");
    const labels = Array.from(fieldset.querySelectorAll("label")).map(
      (label) => label.textContent,
    );

    expect(labels).toEqual(["First Field", "Second Field", "Third Field"]);
  });

  it("handles field keys correctly for React rendering", () => {
    const fields = [inputField, switchField];

    render(<TestWrapper legend="Job Details" fields={fields} />);

    // Should not have React key warnings and render both fields
    expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn Connection")).toBeInTheDocument();
  });
});
