"use client";

import { FormProvider } from "react-hook-form";

import { Card } from "~/components/ui/card";
import { ErrorAlert } from "~/components/ui/error-alert";
import { useJobApplicationForm } from "~/hooks/useJobApplicationForm";

import { JobApplicationForm } from "./job-application/JobApplicationForm";

const ApplicationDetails = () => {
  const { form, onSubmit, isSubmitting, submitError, clearError } =
    useJobApplicationForm();

  return (
    <Card className="mx-auto w-full max-w-4xl p-6">
      <h2 className="mb-6 text-center text-2xl font-bold">
        Add Application Details
      </h2>
      {submitError && <ErrorAlert error={submitError} onDismiss={clearError} />}
      <FormProvider {...form}>
        <JobApplicationForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </FormProvider>
    </Card>
  );
};
export default ApplicationDetails;
