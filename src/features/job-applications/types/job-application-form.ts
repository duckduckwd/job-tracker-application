import type { UseFormReturn } from "react-hook-form";

import type { JobApplicationInput } from "~/schemas/jobApplication.schema";

export interface UseJobApplicationFormReturn {
  form: UseFormReturn<JobApplicationInput>;
  onSubmit: (data: JobApplicationInput) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  clearError: () => void;
}
