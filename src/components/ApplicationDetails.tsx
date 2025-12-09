import type { ComponentProps } from "react";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const FormInput = ({
  label,
  id,
  ...props
}: { label: string; id: string } & ComponentProps<typeof Input>) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} {...props} />
  </div>
);

const JobDetailsSection = () => (
  <fieldset className="space-y-4">
    <FormInput
      label="Role"
      id="roleTitle"
      type="text"
      placeholder="Enter role name"
      required
    />
    <FormInput
      label="Company"
      id="companyName"
      type="text"
      placeholder="Enter company name"
      required
    />
    <FormInput
      label="Role Type"
      id="roleType"
      type="text"
      list="roleTypes"
      placeholder="Select or enter role type..."
      required
    />
    <FormInput
      label="Location"
      id="location"
      type="text"
      list="locations"
      placeholder="Select or enter location"
      required
    />
    <FormInput
      label="Salary"
      id="salary"
      type="text"
      list="salary"
      placeholder="Enter advertised salary"
      required
    />
  </fieldset>
);

const ApplicationSection = () => (
  <fieldset className="space-y-4">
    <FormInput label="Date Applied" id="dateApplied" type="date" />
    <FormInput
      label="Advert Link"
      id="advertLink"
      type="url"
      placeholder="Enter advert link"
      required
    />
    <FormInput
      label="CV Used"
      id="cvUsed"
      type="text"
      placeholder="Enter name of CV used"
    />
    <FormInput label="Response Date" id="responseDate" type="date" />
    <FormInput
      label="Status"
      id="status"
      type="text"
      list="status"
      placeholder="Choose status"
    />
  </fieldset>
);

const ContactSection = () => (
  <fieldset className="space-y-4">
    <FormInput
      label="Contact Name"
      id="contactName"
      type="text"
      placeholder="Enter company contact name"
    />
    <FormInput
      label="Contact Email"
      id="contactEmail"
      type="email"
      placeholder="Enter company contact's email"
    />
    <FormInput
      label="Contact Phone"
      id="contactPhone"
      type="text"
      placeholder="Enter company contact's phone number"
    />
  </fieldset>
);

const ApplicationDetails = () => {
  return (
    <Card className="max-w-2l p6 mx-auto">
      <h2 className="mb-6 text-2xl font-bold">Add Application Details</h2>
      <form className="space-y-6">
        <JobDetailsSection />
        <ApplicationSection />
        <ContactSection />
        <Button type="submit" className="w-full">
          Save Application Details
        </Button>
      </form>
    </Card>
  );
};
export default ApplicationDetails;
