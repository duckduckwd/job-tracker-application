import type { ComponentProps } from "react";
import { type FieldError, type UseFormRegister } from "react-hook-form";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type JobApplicationInput } from "~/schemas/jobApplication.schema";

export const FormInput = ({
  label,
  id,
  register,
  error,
  isDirty,
  ...props
}: {
  label: string;
  id: keyof JobApplicationInput;
  register: UseFormRegister<JobApplicationInput>;
  error?: FieldError;
  isDirty?: boolean;
} & Omit<ComponentProps<typeof Input>, "name">) => {
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Input
        id={id}
        {...register(id)}
        aria-invalid={error && isDirty ? "true" : undefined}
        aria-describedby={error && isDirty ? errorId : undefined}
        {...props}
      />
      {error && isDirty && (
        <span id={errorId} className="mt-1 text-sm text-red-500">
          {error.message}
        </span>
      )}
    </div>
  );
};
