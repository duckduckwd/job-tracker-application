import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { type JobApplicationInput } from "~/schemas/jobApplication.schema";

import { FormInput } from "./form-input";
import { FormSwitch } from "./form-switch";

export type FieldConfig = {
  id: keyof JobApplicationInput;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  list?: string;
};

export type SwitchConfig = {
  id: keyof JobApplicationInput;
  label: string;
  type: "switch";
};

interface FormSectionProps {
  errors: FieldErrors<JobApplicationInput>;
  legend: string;
  fields: (FieldConfig | SwitchConfig)[];
  register: UseFormRegister<JobApplicationInput>;
}

export const FormSection = ({
  errors,
  legend,
  fields,
  register,
}: FormSectionProps) => {
  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">{legend}</legend>
      {fields.map((field) =>
        field.type === "switch" ? (
          <FormSwitch key={field.id} register={register} {...field} />
        ) : (
          <FormInput
            key={field.id}
            register={register}
            error={errors[field.id]}
            {...field}
          />
        ),
      )}
    </fieldset>
  );
};
