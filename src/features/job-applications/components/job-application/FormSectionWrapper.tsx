import { memo } from "react";
import { useFormContext } from "react-hook-form";

import {
  type FieldConfig,
  FormSection,
  type SwitchConfig,
} from "~/components/forms/form-section";
import { type JobApplicationInput } from "~/schemas/jobApplication.schema";

export const FormSectionWrapper = memo(
  ({
    legend,
    fields,
  }: {
    legend: string;
    fields: (FieldConfig | SwitchConfig)[];
  }) => {
    const {
      register,
      formState: { errors /*dirtyFields*/ },
    } = useFormContext<JobApplicationInput>();
    return (
      <FormSection
        legend={legend}
        fields={fields}
        register={register}
        errors={errors}
        // dirtyFields={dirtyFields}
      />
    );
  },
);

FormSectionWrapper.displayName = "FormSectionWrapper";
