import { z } from "zod";

export const jobApplicationSchema = z
  .object({
    roleTitle: z.string().min(1, "Role is required"),
    companyName: z.string().min(1, "Company name is required"),
    roleType: z.string().min(1, "Role type is required"),
    location: z.string().min(1, "Location is required"),
    salary: z.string().optional().or(z.literal("")),
    dateApplied: z.string().min(1, "Date applied is required"),
    advertLink: z
      .string()
      .url("Must be a valid URL")
      .refine(
        (url) => {
          const protocol = url.split(":")[0]?.toLowerCase();
          return protocol === "http" || protocol === "https";
        },
        { message: "Only HTTP and HTTPS protocols are allowed" },
      ),
    cvUsed: z.string().optional(),
    responseDate: z.string().date().optional().or(z.literal("")),
    status: z.string().min(1, "Status is required"),
    contactName: z.string().optional(),
    contactEmail: z
      .string()
      .email("Must be a valid email")
      .optional()
      .or(z.literal("")),
    contactPhone: z
      .string()
      .regex(/^[\d\s()+\-]*$/, "Invalid phone number format")
      .optional()
      .or(z.literal("")),
    isLinkedInConnection: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (
        data.dateApplied &&
        data.responseDate &&
        data.dateApplied !== "" &&
        data.responseDate !== ""
      ) {
        return new Date(data.responseDate) >= new Date(data.dateApplied);
      }
      return true;
    },
    {
      message: "Response date cannot be before application date",
      path: ["responseDate"],
    },
  );

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
