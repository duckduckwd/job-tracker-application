import { Accordion } from "@radix-ui/react-accordion";
import { memo, useState } from "react";

import { CollapsibleSection } from "~/components/ui/collapsible-section";
import {
  sectionLegends,
  sectionTitles,
} from "~/config/forms/form-sections.config";
import {
  contactFields,
  jobDetailsFields,
  timelineFields,
} from "~/config/forms/job-application-fields.config";

import { FormSectionWrapper } from "./FormSectionWrapper";

export const JobApplicationSections = memo(() => {
  const [openItem, setOpenItem] = useState<string>(sectionTitles.role);

  return (
    <Accordion
      type="single"
      collapsible
      className="border-border rounded-md border bg-white/5"
      onValueChange={setOpenItem}
      defaultValue={openItem}
    >
      <CollapsibleSection
        sectionTitle={sectionTitles.role}
        openItem={openItem === sectionTitles.role}
      >
        <FormSectionWrapper
          legend={sectionLegends.role}
          fields={jobDetailsFields}
        />
      </CollapsibleSection>
      <CollapsibleSection
        sectionTitle={sectionTitles.timeline}
        openItem={openItem === sectionTitles.timeline}
      >
        <FormSectionWrapper
          legend={sectionLegends.timeline}
          fields={timelineFields}
        />
      </CollapsibleSection>
      <CollapsibleSection
        sectionTitle={sectionTitles.contact}
        openItem={openItem === sectionTitles.contact}
      >
        <FormSectionWrapper
          legend={sectionLegends.contact}
          fields={contactFields}
        />
      </CollapsibleSection>
    </Accordion>
  );
});

JobApplicationSections.displayName = "JobApplicationSections";
