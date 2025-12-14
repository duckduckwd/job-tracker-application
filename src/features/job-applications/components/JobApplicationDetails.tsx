"use client";

import { lazy, Suspense } from "react";
import { FormProvider } from "react-hook-form";

import { AutoSaveIndicator } from "~/components/ui/auto-save-indicator";
import { Card } from "~/components/ui/card";
import { ErrorAlert } from "~/components/ui/error-alert";
import { ErrorBoundary } from "~/components/ui/error-boundary";
import { SkipLinks } from "~/components/ui/skip-links";
import { JobApplicationFormSkeleton } from "~/features/job-applications/components/job-application/JobApplicationFormSkeleton";
import { useJobApplicationForm } from "~/features/job-applications/hooks/useJobApplicationForm";

// Lazy load the form component
const JobApplicationForm = lazy(() =>
  import("./job-application/JobApplicationForm").then((module) => ({
    default: module.JobApplicationForm,
  })),
);

const JobApplicationDetails = (): React.ReactElement => {
  const { form, onSubmit, isSubmitting, submitError, clearError } =
    useJobApplicationForm();

  return (
    <ErrorBoundary>
      <SkipLinks
        links={[
          { href: "#main-content", label: "Skip to main content" },
          { href: "#application-form", label: "Skip to form" },
        ]}
      />
      <main
        id="main-content"
        role="main"
        aria-labelledby="form-title"
        tabIndex={-1}
      >
        <Card className="mx-auto w-full max-w-4xl p-6">
          <header className="text-center">
            <h1 id="form-title" className="text-2xl font-bold">
              Add Application Details
              <AutoSaveIndicator
                isDirty={form.formState.isDirty}
                className="mt-2"
                aria-live="polite"
              />
            </h1>
          </header>
          {submitError && (
            <section role="alert" aria-labelledby="error-handling">
              <ErrorAlert error={submitError} onDismiss={clearError} />
            </section>
          )}
          <section id="application-form" aria-labelledby="form-title">
            <FormProvider {...form}>
              <Suspense fallback={<JobApplicationFormSkeleton />}>
                <JobApplicationForm
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                />
              </Suspense>
            </FormProvider>
          </section>
        </Card>
      </main>
    </ErrorBoundary>
  );
};
export default JobApplicationDetails;
