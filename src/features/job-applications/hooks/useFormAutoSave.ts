import { useEffect } from "react";
import { type UseFormReturn } from "react-hook-form";

import type { JobApplicationInput } from "~/schemas/jobApplication.schema";

const AUTO_SAVE_KEY = "job-application-draft";

export const useFormAutoSave = (form: UseFormReturn<JobApplicationInput>) => {
  // Load saved draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(AUTO_SAVE_KEY);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft) as JobApplicationInput;
          form.reset(parsedDraft);
        } catch (error) {
          console.warn("Failed to load saved draft:", error);
          localStorage.removeItem(AUTO_SAVE_KEY);
        }
      }
    } catch (error) {
      console.warn("localStorage unavailable:", error);
    }
  }, [form]);

  // Auto-save form data
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        try {
          localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
        } catch (error) {
          console.warn("Failed to save draft:", error);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
    } catch (error) {
      console.warn("Failed to clear draft:", error);
    }
  };

  return { clearDraft };
};
