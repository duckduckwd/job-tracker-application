import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import {
  type JobApplicationInput,
  jobApplicationSchema,
} from "~/schemas/jobApplication.schema";

export const useJobApplicationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<JobApplicationInput>({
    resolver: zodResolver(jobApplicationSchema),
    mode: "onChange",
    defaultValues: {
      isLinkedInConnection: false,
    },
  });

  const onSubmit = useCallback(async (data: JobApplicationInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // TODO: Replace with actual API call
      console.warn("Form submitted");
      console.warn(data);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => setSubmitError(null), []);

  return {
    form,
    onSubmit,
    isSubmitting,
    submitError,
    clearError,
  };
};
