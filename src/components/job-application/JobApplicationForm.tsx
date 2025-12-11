import { memo, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/button";
import { type JobApplicationInput } from "~/schemas/jobApplication.schema";

import { JobApplicationSections } from "./JobApplicationSections";

export const JobApplicationForm = memo(
  ({
    onSubmit,
    isSubmitting,
  }: {
    onSubmit: (data: JobApplicationInput) => Promise<void>;
    isSubmitting: boolean;
  }) => {
    const { handleSubmit } = useFormContext<JobApplicationInput>();

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
      if (isSubmitting && formRef.current) {
        const submitButton = formRef.current.querySelector(
          'button[type="submit"]',
        );
        (submitButton as HTMLButtonElement | null)?.focus();
      }
    }, [isSubmitting]);

    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="mx-20 space-y-6"
        noValidate
        aria-label="Add Application Details Form"
        aria-busy={isSubmitting}
      >
        <fieldset
          disabled={isSubmitting}
          className="space-y-6"
          aria-describedby={isSubmitting ? "form-status" : undefined}
        >
          <legend className="sr-only">Add Job Application Details</legend>
          <JobApplicationSections />
        </fieldset>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          aria-describedby="form-status"
        >
          {isSubmitting ? "Saving..." : "Save Application Details"}
        </Button>
        <div id="form-status" className="sr-only">
          {isSubmitting && "Form submission in progress"}
        </div>
      </form>
    );
  },
);

JobApplicationForm.displayName = "JobApplicationForm";
