# Testing Guide

## Philosophy

We follow **Kent C. Dodds' testing philosophy**: "Test the application the way users use it."

- Write user-focused integration tests, not brittle unit tests
- Test behaviour, not implementation details
- Prioritize accessibility and real user interactions
- Avoid over-testing internal logic

## Testing Stack

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing with user-centric queries
- **@testing-library/user-event** - Realistic user interaction simulation
- **jest-axe** - Automated accessibility testing (WCAG compliance)

## Test Types

### 1. Schema Tests (Zod Validation)

Test validation logic in isolation before components.

```typescript
// src/schemas/jobApplication.schema.test.ts
describe("jobApplicationSchema", () => {
  it("should accept valid data", () => {
    const result = jobApplicationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = jobApplicationSchema.safeParse({
      ...validData,
      contactEmail: "invalid",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Must be a valid email");
  });
});
```

**Best Practices:**

- Use test utilities (`expectValidationSuccess`, `expectValidationError`)
- Test happy path, edge cases, boundaries, security scenarios
- Use parameterized tests (`test.each`) for similar cases
- Verify error messages match user-facing text

### 2. Component Tests (React)

Test components as users interact with them.

```typescript
// src/components/ApplicationDetails.test.tsx
describe("ApplicationDetails", () => {
  it("should show error when required field is left empty on blur", async () => {
    const user = userEvent.setup();
    render(<ApplicationDetails />);

    const roleInput = screen.getByLabelText(/^role$/i);
    await user.click(roleInput);
    await user.tab();

    expect(await screen.findByText("Role is required")).toBeInTheDocument();
  });
});
```

**Best Practices:**

- Use `userEvent` for realistic interactions (not `fireEvent`)
- Query by accessible labels/roles (not test IDs or classes)
- Create test data factories for maintainability
- Test validation, submission, user interactions, accessibility, keyboard navigation
- Include performance budgets for critical paths

### 3. Accessibility Tests

Automated WCAG compliance testing.

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

it("should have no accessibility violations", async () => {
  const { container } = render(<ApplicationDetails />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Also test:**

- ARIA attributes (`aria-invalid`, `aria-describedby`)
- Keyboard navigation (tab, shift+tab, enter)
- Screen reader compatibility (proper labels)

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test ApplicationDetails.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="validation"

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Test Structure

```text
src/
├── schemas/
│   ├── jobApplication.schema.ts
│   └── jobApplication.schema.test.ts    # Schema validation tests
└── components/
    ├── ApplicationDetails.tsx
    └── ApplicationDetails.test.tsx       # Component integration tests
```

## Coverage Requirements

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

Configure in `jest.config.ts`:

```typescript
coverageThreshold: {
  global: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
},
```

## Test Utilities

Create reusable helpers for common patterns:

```typescript
// Test data factory
const createValidFormData = () => ({
  role: "Software Engineer",
  company: "Tech Corp",
  // ...
});

// Helper to fill required fields
const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  const data = createValidFormData();
  await user.type(screen.getByLabelText(/^role$/i), data.role);
  // ...
};

// Validation test utilities
const expectValidationSuccess = (data: unknown) => {
  const result = schema.safeParse(data);
  expect(result.success).toBe(true);
};
```

## What NOT to Test

- Third-party library internals (React Hook Form, Zod)
- Styling/CSS (unless accessibility-related)
- Implementation details (state variables, internal functions)
- Trivial code (simple getters, constants)

## ESLint Overrides for Tests

Test files are excluded from certain rules for readability:

```javascript
// eslint.config.js
{
  files: ["**/*.test.ts", "**/*.test.tsx"],
  rules: {
    "max-lines-per-function": "off",
    "sonarjs/no-duplicate-string": "off",
  },
}
```

## Enterprise Testing Checklist

- [ ] Schema tests with happy path, edge cases, boundaries, security
- [ ] Component tests with validation, submission, interactions
- [ ] Accessibility tests with jest-axe
- [ ] ARIA attribute verification
- [ ] Keyboard navigation tests
- [ ] Performance budgets for critical paths
- [ ] Test data factories for maintainability
- [ ] 100% coverage for critical components
- [ ] User-focused queries (not test IDs)
- [ ] Realistic user interactions (userEvent)

## Examples

See enterprise-level test implementations:

- `src/schemas/jobApplication.schema.test.ts` - Schema validation (50+ tests)
- `src/components/ApplicationDetails.test.tsx` - Component integration (28 tests)
