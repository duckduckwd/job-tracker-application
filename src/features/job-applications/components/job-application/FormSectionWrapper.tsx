import { memo } from "react";
import { useFormContext } from "react-hook-form";

import {
  type FieldConfig,
  FormSection,
  type SwitchConfig,
} from "~/components/forms/form-section";
import { type JobApplicationInput } from "~/schemas/jobApplication.schema";

export interface FormSectionWrapperProps {
  legend: string;
  sectionId: string;
  fields: (FieldConfig | SwitchConfig)[];
}

export const FormSectionWrapper = memo(
  ({ legend, fields, sectionId }: FormSectionWrapperProps) => {
    const {
      register,
      formState: { errors },
    } = useFormContext<JobApplicationInput>();

    return (
      <FormSection
        errors={errors}
        legend={legend}
        fields={fields}
        register={register}
        sectionId={sectionId}
      />
    );
  },
);

FormSectionWrapper.displayName = "FormSectionWrapper";
