import { type UseFormRegister } from "react-hook-form";

import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { type JobApplicationInput } from "~/schemas/jobApplication.schema";

export const FormSwitch = ({
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
