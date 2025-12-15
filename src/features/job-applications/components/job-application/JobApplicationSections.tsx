import { Accordion } from "@radix-ui/react-accordion";
import { memo, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import { CollapsibleSection } from "~/components/ui/collapsible-section";
import { sectionConfig } from "~/config/forms/form-sections.config";
import { type JobApplicationInput } from "~/schemas/jobApplication.schema";

import { FormSectionWrapper } from "./FormSectionWrapper";

export const getFields = (
  section: (typeof sectionConfig)[keyof typeof sectionConfig],
) => {
  if ("jobDetailsFields" in section) return section.jobDetailsFields;
  if ("timelineFields" in section) return section.timelineFields;
  if ("contactFields" in section) return section.contactFields;
  return [];
};

interface JobApplicationSectionsState {
  role: boolean;
  timeline: boolean;
  contact: boolean;
}

export const JobApplicationSections = memo(() => {
  const [openItem, setOpenItem] = useState<string>(sectionConfig.role.title);
  const {
    formState: { errors },
  } = useFormContext<JobApplicationInput>();

  const sectionHasErrors = useMemo(() => {
    const result: JobApplicationSectionsState = {
      role: false,
      timeline: false,
      contact: false,
    };

    for (const [key, section] of Object.entries(sectionConfig)) {
      const fields = getFields(section);
      result[key as keyof JobApplicationSectionsState] = fields.some(
        (field) => errors[field.id],
      );
    }

    return result;
  }, [errors]);

  return (
    <Accordion
      type="single"
      collapsible
      className="border-border rounded-md border bg-white/5"
      onValueChange={setOpenItem}
      defaultValue={openItem}
    >
      {Object.entries(sectionConfig).map(([key, section]) => (
        <CollapsibleSection
          key={key}
          sectionTitle={section.title}
          openItem={openItem === section.title}
          sectionHasErrors={
            sectionHasErrors[key as keyof typeof sectionHasErrors]
          }
        >
          <FormSectionWrapper
            legend={section.legend}
            sectionId={section.id}
            fields={getFields(section)}
          />
        </CollapsibleSection>
      ))}
    </Accordion>
  );
});

JobApplicationSections.displayName = "JobApplicationSections";
