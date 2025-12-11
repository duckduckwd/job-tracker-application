import {
  type FieldConfig,
  type SwitchConfig,
} from "~/components/forms/form-section";

export const jobDetailsFields: FieldConfig[] = [
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

export const timelineFields: FieldConfig[] = [
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

export const contactFields: (FieldConfig | SwitchConfig)[] = [
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
