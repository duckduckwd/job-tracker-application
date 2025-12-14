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

export const FormSection = ({
  legend,
  fields,
  register,
  errors,
  // dirtyFields,
}: {
  legend: string;
  fields: (FieldConfig | SwitchConfig)[];
  register: UseFormRegister<JobApplicationInput>;
  errors: FieldErrors<JobApplicationInput>;
  // dirtyFields: Partial<Record<keyof JobApplicationInput, boolean>>;
}) => (
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
