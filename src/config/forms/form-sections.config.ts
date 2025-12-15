import {
  contactFields,
  jobDetailsFields,
  timelineFields,
} from "~/config/forms/job-application-fields.config";

export const sectionConfig = {
  role: {
    id: "role",
    title: "Role Details (Role, Company, Role Type, Location, Salary)",
    legend: "Role Details",
    jobDetailsFields,
  },
  timeline: {
    id: "timeline",
    title:
      "Timeline (Date Applied, Advert Link, CV Used, Response Date, Status)",
    legend: "Timeline",
    timelineFields,
  },
  contact: {
    id: "contact",
    title: "Contact Details (Name, Email, Phone, LinkedIn Connection)",
    legend: "Contact Details",
    contactFields,
  },
};
