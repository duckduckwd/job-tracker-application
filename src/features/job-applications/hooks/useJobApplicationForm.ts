import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import type { UseJobApplicationFormReturn } from "~/features/job-applications/types/job-application-form";
import {
  type JobApplicationInput,
  jobApplicationSchema,
} from "~/schemas/jobApplication.schema";

import { useFormAutoSave } from "./useFormAutoSave";
import { useFormSubmission } from "./useFormSubmission";

export const useJobApplicationForm = (): UseJobApplicationFormReturn => {
  const form = useForm<JobApplicationInput>({
    resolver: zodResolver(jobApplicationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      isLinkedInConnection: false,
    },
  });

  const { clearDraft } = useFormAutoSave(form);
  const { submitForm, isSubmitting, submitError, clearError } =
    useFormSubmission();

  const onSubmit = useCallback(
    async (data: JobApplicationInput) => {
      await submitForm(data);
      clearDraft();
      form.reset({ isLinkedInConnection: false });
    },
    [submitForm, clearDraft, form],
  );

  return {
    form,
    onSubmit,
    isSubmitting,
    submitError,
    clearError,
  };
};
