# UI Components Guide

## Overview

This template includes Tailwind CSS v4 and the `cn()` utility for class merging. UI components can be added as needed using shadcn/ui or built from scratch.

## Quick Setup with shadcn/ui (Recommended)

### Installation

```bash
# Initialize shadcn/ui (auto-detects Tailwind config)
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

### Configuration

shadcn/ui will create `components.json` with these settings:

```json
{
  "style": "new-york",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate"
  },
  "aliases": {
    "components": "~/components",
    "utils": "~/utils"
  }
}
```

### Commonly Used Components

```bash
# Forms
npx shadcn@latest add button input label textarea select checkbox radio-group

# Layout
npx shadcn@latest add card separator

# Feedback
npx shadcn@latest add toast alert dialog

# Navigation
npx shadcn@latest add dropdown-menu tabs

# Data Display
npx shadcn@latest add table badge avatar
```

### Usage Example

```typescript
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button type="submit">Sign In</Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

## Building Custom Components

### Using the cn() Utility

The template includes a `cn()` utility for merging Tailwind classes:

```typescript
import { cn } from "~/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded font-medium transition-colors",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300",
        className
      )}
      {...props}
    />
  )
}
```

### Component Patterns

#### 1. Base Component with Variants

```typescript
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "~/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 hover:bg-gray-100",
        ghost: "hover:bg-gray-100",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
```

#### 2. Compound Components

```typescript
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border bg-white shadow-sm", className)} {...props} />
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-2xl font-semibold", className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}
```

#### 3. Accessible Form Components

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded border px-3 py-2 focus:outline-none focus:ring-2",
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
```

## Component Organization

### Directory Structure

```text
components/
├── ui/                    # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── index.ts          # Re-export all
├── forms/                # Form-specific components
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── layout/               # Layout components
│   ├── Header.tsx
│   └── Footer.tsx
└── index.ts              # Main export
```

### Export Pattern

```typescript
// components/ui/index.ts
export { Button } from "./button";
export { Input } from "./input";
export { Card, CardHeader, CardTitle, CardContent } from "./card";

// Usage
import { Button, Input, Card } from "~/components/ui";
```

## Styling Guidelines

### Tailwind Best Practices

```typescript
// ✅ Good: Use Tailwind utilities
<div className="flex items-center gap-4 p-6">

// ❌ Avoid: Inline styles
<div style={{ display: "flex", padding: "24px" }}>

// ✅ Good: Use cn() for conditional classes
<div className={cn("base-class", isActive && "active-class")}>

// ❌ Avoid: String concatenation
<div className={"base-class" + (isActive ? " active-class" : "")}>
```

### Responsive Design

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

### Dark Mode Support

```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* Automatically adapts to system preference */}
</div>
```

## Accessibility Checklist

### Interactive Elements

- ✅ Use semantic HTML (`<button>`, `<a>`, `<input>`)
- ✅ Include ARIA labels for icon-only buttons
- ✅ Ensure keyboard navigation works
- ✅ Provide focus indicators
- ✅ Use proper heading hierarchy

### Forms

- ✅ Associate labels with inputs
- ✅ Provide error messages with `aria-describedby`
- ✅ Use `aria-invalid` for error states
- ✅ Include placeholder text when helpful
- ✅ Support keyboard submission

### Example

```typescript
<button
  aria-label="Close dialog"
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <XIcon className="h-5 w-5" />
</button>
```

## Testing Components

### Component Tests

```typescript
import { render, screen } from "@testing-library/react"
import { Button } from "./button"

describe("Button", () => {
  test("renders with text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
  })

  test("handles click events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByRole("button").click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Alternative UI Libraries

### Headless UI

```bash
npm install @headlessui/react
```

Unstyled, accessible components from Tailwind Labs.

### Radix UI

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

Low-level primitives for building custom components.

### Material UI (MUI)

```bash
npm install @mui/material @emotion/react @emotion/styled
```

Complete component library (heavier, different styling approach).

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Headless UI](https://headlessui.com)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
