"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type FieldErrors,
  useForm,
  type UseFormRegister,
} from "react-hook-form";

import {
  type FieldConfig,
  FormSection,
  type SwitchConfig,
} from "~/components/forms/form-section";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { CollapsibleSection } from "~/components/ui/collapsible-section";
import {
  type JobApplicationInput,
  jobApplicationSchema,
} from "~/schemas/jobApplication.schema";

const sectionTitles = {
  role: "Role Details (Role, Company, Role Type, Location, Salary)",
  timeline:
    "Timeline (Date Applied, Advert Link, CV Used, Response Date, Status)",
  contact: "Contact Details (Name, Email, Phone, LinkedIn Connection)",
};

const jobDetailsFields: FieldConfig[] = [
  {
    id: "roleTitle",
    label: "Role",
    type: "text",
    placeholder: "Role (e.g. Senior Software Engineer)",
    required: true,
  },
  {
    id: "companyName",
    label: "Company",
    type: "text",
    placeholder: "Company (e.g. Acme Corp)",
    required: true,
  },
  {
    id: "roleType",
    label: "Role Type",
    list: "roleTypes",
    type: "text",
    placeholder: "Role Type (e.g. Software Engineering Manager)",
    required: true,
  },
  {
    id: "location",
    label: "Location",
    type: "text",
    list: "locations",
    placeholder: "Location (e.g. Manchester, Remote, Hybrid)",
    required: true,
  },
  {
    id: "salary",
    label: "Salary",
    type: "text",
    list: "salary",
    placeholder: "Advertised salary (e.g. £75-85k)",
  },
];

const timelineFields: FieldConfig[] = [
  {
    id: "dateApplied",
    label: "Date Applied",
    type: "date",
    placeholder: "Date Applied (dd/mm/yyyy)",
    required: true,
  },
  {
    id: "advertLink",
    label: "Advert Link",
    type: "url",
    placeholder: "Advert Link (e.g. https://jobs.jobfinder.com/roleId",
    required: true,
  },
  {
    id: "cvUsed",
    label: "CV Used",
    type: "text",
    placeholder: "CV used (e.g. john_doe_se_2025.pdf)",
  },
  {
    id: "responseDate",
    label: "Response Date",
    type: "date",
    placeholder: "Response Date (dd/mm/yyyy)",
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    list: "status",
    placeholder: "Status (e.g. Applied, Rejected)",
    required: true,
  },
];

const contactFields: (FieldConfig | SwitchConfig)[] = [
  {
    id: "contactName",
    label: "Contact Name",
    type: "text",
    placeholder: "Company contact name (e.g. Jayne Doe)",
  },
  {
    id: "contactEmail",
    label: "Contact Email",
    type: "email",
    placeholder: "Company contact's email (jayne.dow@recruiters.com)",
  },
  {
    id: "contactPhone",
    label: "Contact Phone",
    type: "text",
    placeholder: "Contact's phone number (e.g. 07654321234)",
  },
  {
    id: "isLinkedInConnection",
    label: "LinkedIn Connection",
    type: "switch",
  },
];

const JobDetailsSection = ({
  register,
  errors,
  dirtyFields,
}: {
  register: UseFormRegister<JobApplicationInput>;
  errors: FieldErrors<JobApplicationInput>;
  dirtyFields: Partial<Record<keyof JobApplicationInput, boolean>>;
}) => (
  <FormSection
    legend="Role Details"
    fields={jobDetailsFields}
    register={register}
    errors={errors}
    dirtyFields={dirtyFields}
  />
);

const ApplicationSection = ({
  register,
  errors,
  dirtyFields,
}: {
  register: UseFormRegister<JobApplicationInput>;
  errors: FieldErrors<JobApplicationInput>;
  dirtyFields: Partial<Record<keyof JobApplicationInput, boolean>>;
}) => (
  <FormSection
    legend="Application Timeline"
    fields={timelineFields}
    register={register}
    errors={errors}
    dirtyFields={dirtyFields}
  />
);

const ContactSection = ({
  register,
  errors,
  dirtyFields,
}: {
  register: UseFormRegister<JobApplicationInput>;
  errors: FieldErrors<JobApplicationInput>;
  dirtyFields: Partial<Record<keyof JobApplicationInput, boolean>>;
}) => (
  <FormSection
    legend="Application Contacts"
    fields={contactFields}
    register={register}
    errors={errors}
    dirtyFields={dirtyFields}
  />
);

const ApplicationDetails = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<JobApplicationInput>({
    resolver: zodResolver(jobApplicationSchema),
    mode: "onChange",
    defaultValues: {
      isLinkedInConnection: false,
    },
  });

  const onSubmit = async (data: JobApplicationInput) => {
    console.warn("Form submitted");
    console.warn(data);
  };

  return (
    <Card className="p6 mx-auto w-full max-w-4xl">
      <h2 className="mb-6 text-center text-2xl font-bold">
        Add Application Details
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-20 space-y-6"
        noValidate
      >
        <CollapsibleSection
          sectionTitle={sectionTitles.role}
          rootProps={{ defaultOpen: true }}
        >
          <JobDetailsSection
            register={register}
            errors={errors}
            dirtyFields={dirtyFields}
          />
        </CollapsibleSection>
        <CollapsibleSection sectionTitle={sectionTitles.timeline}>
          <ApplicationSection
            register={register}
            errors={errors}
            dirtyFields={dirtyFields}
          />
        </CollapsibleSection>
        <CollapsibleSection sectionTitle={sectionTitles.contact}>
          <ContactSection
            register={register}
            errors={errors}
            dirtyFields={dirtyFields}
          />
        </CollapsibleSection>
        <Button type="submit" className="w-full">
          Save Application Details
        </Button>
      </form>
    </Card>
  );
};
export default ApplicationDetails;
