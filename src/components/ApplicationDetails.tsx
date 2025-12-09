import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentProps } from "react";
import {
  type FieldError,
  type FieldErrors,
  useForm,
  type UseFormRegister,
} from "react-hook-form";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  type JobApplicationInput,
  jobApplicationSchema,
} from "~/schemas/jobApplication.schema";

const FormInput = ({
  label,
  id,
  register,
  error,
  ...props
}: {
  label: string;
  id: keyof JobApplicationInput;
  register: UseFormRegister<JobApplicationInput>;
  error?: FieldError;
} & Omit<ComponentProps<typeof Input>, "name">) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} {...register(id)} {...props} />
    {error && (
      <span className="mt-1 text-sm text-red-500">{error.message}</span>
    )}
  </div>
);

const FormSwitch = ({
  label,
  id,
  register,
}: {
  label: string;
  id: keyof JobApplicationInput;
  register: UseFormRegister<JobApplicationInput>;
}) => (
  <div className="flex items-center space-x-2">
    <Switch id={id} {...register(id)} />
    <Label htmlFor={id}>{label}</Label>
  </div>
);

const JobDetailsSection = ({
  register,
  errors,
}: {
  register: UseFormRegister<JobApplicationInput>;
  errors: FieldErrors<JobApplicationInput>;
}) => (
  <fieldset className="space-y-4">
    <FormInput
      register={register}
      error={errors.roleTitle}
      label="Role"
      id="roleTitle"
      type="text"
      placeholder="Enter role name"
      required
    />
    <FormInput
      register={register}
      error={errors.companyName}
      label="Company"
      id="companyName"
      type="text"
      placeholder="Enter company name"
      required
    />
    <FormInput
      register={register}
      error={errors.roleType}
      label="Role Type"
      id="roleType"
      type="text"
      list="roleTypes"
      placeholder="Select or enter role type..."
      required
    />
    <FormInput
      register={register}
      error={errors.location}
      label="Location"
      id="location"
      type="text"
      list="locations"
      placeholder="Select or enter location"
      required
    />
    <FormInput
      register={register}
      error={errors.salary}
      label="Salary"
      id="salary"
      type="text"
      list="salary"
      placeholder="Enter advertised salary"
    />
  </fieldset>
);

const ApplicationSection = ({
  register,
  errors,
}: {
  register: UseFormRegister<JobApplicationInput>;
  errors: FieldErrors<JobApplicationInput>;
}) => (
  <fieldset className="space-y-4">
    <FormInput
      register={register}
      error={errors.dateApplied}
      label="Date Applied"
      id="dateApplied"
      type="date"
    />
    <FormInput
      register={register}
      error={errors.advertLink}
      label="Advert Link"
      id="advertLink"
      type="url"
      placeholder="Enter advert link"
      required
    />
    <FormInput
      register={register}
      error={errors.cvUsed}
      label="CV Used"
      id="cvUsed"
      type="text"
      placeholder="Enter name of CV used"
    />
    <FormInput
      register={register}
      error={errors.responseDate}
      label="Response Date"
      id="responseDate"
      type="date"
    />
    <FormInput
      register={register}
      error={errors.status}
      label="Status"
      id="status"
      type="text"
      list="status"
      placeholder="Choose status"
    />
  </fieldset>
);

const ContactSection = ({
  register,
  errors,
}: {
  register: UseFormRegister<JobApplicationInput>;
  errors: FieldErrors<JobApplicationInput>;
}) => (
  <fieldset className="space-y-4">
    <FormInput
      register={register}
      error={errors.contactName}
      label="Contact Name"
      id="contactName"
      type="text"
      placeholder="Enter company contact name"
    />
    <FormInput
      register={register}
      error={errors.contactEmail}
      label="Contact Email"
      id="contactEmail"
      type="email"
      placeholder="Enter company contact's email"
    />
    <FormInput
      register={register}
      error={errors.contactPhone}
      label="Contact Phone"
      id="contactPhone"
      type="text"
      placeholder="Enter company contact's phone number"
    />
    <FormSwitch
      register={register}
      label="LinkedIn Connection"
      id="isLinkedInConnection"
    />
  </fieldset>
);

const ApplicationDetails = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobApplicationInput>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      isLinkedInConnection: false,
    },
  });

  const onSubmit = async (data: JobApplicationInput) => {
    console.warn("Form submitted");
    console.warn(data);
  };

  return (
    <Card className="max-w-2l p6 mx-auto">
      <h2 className="mb-6 text-2xl font-bold">Add Application Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <JobDetailsSection register={register} errors={errors} />
        <ApplicationSection register={register} errors={errors} />
        <ContactSection register={register} errors={errors} />
        <Button type="submit" className="w-full">
          Save Application Details
        </Button>
      </form>
    </Card>
  );
};
export default ApplicationDetails;
