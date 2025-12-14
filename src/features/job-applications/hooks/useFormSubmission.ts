import { useCallback, useState } from "react";

import type { JobApplicationInput } from "~/schemas/jobApplication.schema";
import { sanitiseFormData } from "~/utils/sanitisation";

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitForm = useCallback(async (data: JobApplicationInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const sanitisedData = sanitiseFormData(data);
      // TODO: Replace with actual API call
      console.warn("Form submitted");
      console.warn(sanitisedData);
      return sanitisedData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setSubmitError(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => setSubmitError(null), []);

  return {
    submitForm,
    isSubmitting,
    submitError,
    clearError,
  };
};
