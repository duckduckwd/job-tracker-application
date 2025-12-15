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
  // isDirty,
  placeholder,
  ...props
}: {
  label: string;
  id: keyof JobApplicationInput;
  register: UseFormRegister<JobApplicationInput>;
  error?: FieldError;
} & Omit<ComponentProps<typeof Input>, "name">) => {
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id as string}>{label}</Label>
      <Input
        id={id as string}
        {...register(id)}
        placeholder={placeholder ?? label}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span
          id={errorId}
          className="bg-foreground/50 text-destructive border-destructive mt-1 rounded border px-4 text-sm"
        >
          *&nbsp;{error.message}
        </span>
      )}
    </div>
  );
};
