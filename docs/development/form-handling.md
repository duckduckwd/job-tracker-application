# Form Handling Guide

## Overview

This guide covers building type-safe, validated forms using react-hook-form, Zod validation, and Next.js Server Actions.

## Installation

```bash
npm install react-hook-form @hookform/resolvers
```

## Basic Form Pattern

### 1. Define Schema

```typescript
// src/schemas/contact.schema.ts
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
```

### 2. Create Form Component

```typescript
// src/components/forms/ContactForm.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactFormSchema, type ContactFormInput } from "~/schemas"

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormInput) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to submit")

      alert("Message sent successfully!")
      reset()
    } catch (error) {
      alert("Failed to send message")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          {...register("name")}
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          {...register("message")}
          rows={4}
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}
```

## Server Actions Pattern

### 1. Create Server Action

```typescript
// src/app/actions/contact.ts
"use server";

import { revalidatePath } from "next/cache";
import { contactFormSchema } from "~/schemas";
import { db } from "~/server/db";

export async function submitContactForm(formData: FormData) {
  // Parse and validate
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const result = contactFormSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Save to database
  try {
    await db.contact.create({
      data: result.data,
    });

    revalidatePath("/contact");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { _form: ["Failed to submit form"] },
    };
  }
}
```

### 2. Use in Form Component

```typescript
"use client"

import { useFormState, useFormStatus } from "react-dom"
import { submitContactForm } from "~/app/actions/contact"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? "Sending..." : "Send Message"}
    </button>
  )
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {state?.errors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {state?.errors?.message && (
          <p className="mt-1 text-sm text-red-600">{state.errors.message[0]}</p>
        )}
      </div>

      {state?.errors?._form && (
        <p className="text-sm text-red-600">{state.errors._form[0]}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Message sent successfully!</p>
      )}

      <SubmitButton />
    </form>
  )
}
```

## Reusable Form Components

### Form Field Component

```typescript
// src/components/forms/FormField.tsx
import { type UseFormRegister, type FieldError } from "react-hook-form"

interface FormFieldProps {
  label: string
  name: string
  type?: string
  register: UseFormRegister<any>
  error?: FieldError
  placeholder?: string
  required?: boolean
}

export function FormField({
  label,
  name,
  type = "text",
  register,
  error,
  placeholder,
  required,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  )
}
```

### Usage

```typescript
<FormField
  label="Email"
  name="email"
  type="email"
  register={register}
  error={errors.email}
  required
/>
```

## Advanced Patterns

### Multi-Step Form

```typescript
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const steps = ["Personal Info", "Contact Details", "Review"]

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const { register, handleSubmit, formState: { errors }, trigger } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  })

  const nextStep = async () => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate)

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex-1 ${index <= currentStep ? "text-blue-600" : "text-gray-400"}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      {currentStep === 0 && <PersonalInfoStep register={register} errors={errors} />}
      {currentStep === 1 && <ContactDetailsStep register={register} errors={errors} />}
      {currentStep === 2 && <ReviewStep />}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Submit
          </button>
        )}
      </div>
    </form>
  )
}
```

### Dynamic Fields

```typescript
"use client"

import { useFieldArray, useForm } from "react-hook-form"

export function DynamicFieldsForm() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      contacts: [{ name: "", email: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4">
          <input
            {...register(`contacts.${index}.name`)}
            placeholder="Name"
            className="flex-1 rounded border px-3 py-2"
          />
          <input
            {...register(`contacts.${index}.email`)}
            placeholder="Email"
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded border px-3 py-2 text-red-600"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ name: "", email: "" })}
        className="rounded border px-4 py-2"
      >
        Add Contact
      </button>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Submit
      </button>
    </form>
  )
}
```

### File Upload

```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const fileUploadSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required")
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      "File size must be less than 5MB"
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files[0]?.type),
      "Only .jpg, .png, and .webp files are accepted"
    ),
})

export function FileUploadForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(fileUploadSchema),
  })

  const onSubmit = async (data: any) => {
    const formData = new FormData()
    formData.append("file", data.file[0])

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      alert("File uploaded successfully!")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="file" className="block text-sm font-medium">
          Upload Image
        </label>
        <input
          id="file"
          type="file"
          accept="image/*"
          {...register("file")}
          className="mt-1 w-full"
        />
        {errors.file && (
          <p className="mt-1 text-sm text-red-600">
            {errors.file.message as string}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Upload
      </button>
    </form>
  )
}
```

## Form Validation Patterns

### Conditional Validation

```typescript
const schema = z
  .object({
    hasCompany: z.boolean(),
    companyName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasCompany) {
        return data.companyName && data.companyName.length > 0;
      }
      return true;
    },
    {
      message: "Company name is required when 'Has Company' is checked",
      path: ["companyName"],
    },
  );
```

### Custom Validation

```typescript
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

### Async Validation

```typescript
const emailSchema = z
  .object({
    email: z.string().email(),
  })
  .refine(
    async (data) => {
      const response = await fetch(`/api/check-email?email=${data.email}`);
      const { available } = await response.json();
      return available;
    },
    {
      message: "Email is already taken",
      path: ["email"],
    },
  );
```

## Accessibility Best Practices

### Required Fields

```typescript
<label htmlFor="email">
  Email <span className="text-red-600" aria-label="required">*</span>
</label>
<input
  id="email"
  {...register("email")}
  required
  aria-required="true"
/>
```

### Error Announcements

```typescript
<input
  id="email"
  {...register("email")}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-sm text-red-600">
    {errors.email.message}
  </p>
)}
```

### Form Status

```typescript
{isSubmitting && (
  <div role="status" aria-live="polite">
    Submitting form...
  </div>
)}

{submitSuccess && (
  <div role="status" aria-live="polite" className="text-green-600">
    Form submitted successfully!
  </div>
)}
```

## Testing Forms

### Component Tests

```typescript
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ContactForm } from "./ContactForm"

describe("ContactForm", () => {
  test("shows validation errors for empty fields", async () => {
    render(<ContactForm />)

    const submitButton = screen.getByRole("button", { name: /send/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  test("submits form with valid data", async () => {
    render(<ContactForm />)

    await userEvent.type(screen.getByLabelText(/name/i), "John Doe")
    await userEvent.type(screen.getByLabelText(/email/i), "john@example.com")
    await userEvent.type(screen.getByLabelText(/message/i), "Hello, this is a test message")

    const submitButton = screen.getByRole("button", { name: /send/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
    })
  })
})
```

## Resources

- [react-hook-form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [ARIA Form Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/form/)
