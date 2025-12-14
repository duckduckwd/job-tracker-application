import { memo } from "react";

import { CollapsibleSection } from "~/components/ui/collapsible-section";
import { sectionTitles } from "~/config/forms/form-sections.config";
import {
  contactFields,
  jobDetailsFields,
  timelineFields,
} from "~/config/forms/job-application-fields.config";

import { FormSectionWrapper } from "./FormSectionWrapper";

export const JobApplicationSections = memo(() => (
  <>
    <CollapsibleSection
      sectionTitle={sectionTitles.role}
      rootProps={{ defaultOpen: true }}
    >
      <FormSectionWrapper legend="Role Details" fields={jobDetailsFields} />
    </CollapsibleSection>
    <CollapsibleSection sectionTitle={sectionTitles.timeline}>
      <FormSectionWrapper
        legend="Application Timeline"
        fields={timelineFields}
      />
    </CollapsibleSection>
    <CollapsibleSection sectionTitle={sectionTitles.contact}>
      <FormSectionWrapper
        legend="Application Contacts"
        fields={contactFields}
      />
    </CollapsibleSection>
  </>
));

JobApplicationSections.displayName = "JobApplicationSections";
