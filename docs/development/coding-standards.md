# Coding Standards

## Overview

This document defines the coding standards and best practices for the Job Application Tracker project to ensure consistency, maintainability, and quality across the codebase.

## TypeScript Standards

### Type Definitions

```typescript
// ✅ Good: Use explicit interface definitions
interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: Date;
  salary?: string;
  notes?: string;
}

// ✅ Good: Use union types for enums
type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED";

// ❌ Avoid: Using 'any' type
const data: any = response.json();

// ✅ Good: Use proper typing
const data: JobApplication = response.json() as JobApplication;
```

### Function Signatures

```typescript
// ✅ Good: Explicit parameter and return types
async function createJobApplication(
  userId: string,
  jobData: CreateJobApplicationData,
): Promise<JobApplication> {
  // Implementation
}

// ✅ Good: Use optional parameters appropriately
function formatJobTitle(
  company: string,
  position: string,
  remote?: boolean,
): string {
  return remote
    ? `${position} at ${company} (Remote)`
    : `${position} at ${company}`;
}

// ✅ Good: Use proper error handling
function parseJobData(input: unknown): JobApplication {
  if (!isValidJobData(input)) {
    throw new ValidationError("Invalid job data format");
  }
  return input as JobApplication;
}
```

### Generic Types

```typescript
// ✅ Good: Use generics for reusable types
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ✅ Good: Constrain generics when appropriate
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}
```

## React Component Standards

### Component Structure

```typescript
// ✅ Good: Proper component structure
interface JobCardProps {
  job: JobApplication
  onUpdate?: (id: string, data: Partial<JobApplication>) => void
  onDelete?: (id: string) => void
  className?: string
}

export function JobCard({ job, onUpdate, onDelete, className }: JobCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleStatusChange = useCallback((status: ApplicationStatus) => {
    onUpdate?.(job.id, { status })
  }, [job.id, onUpdate])

  return (
    <div className={cn('job-card', className)}>
      {/* Component content */}
    </div>
  )
}
```

### Custom Hooks

```typescript
// ✅ Good: Extract logic into custom hooks
function useJobApplications(userId: string) {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.jobs.getAll(userId);
      setJobs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}
```

### Event Handlers

```typescript
// ✅ Good: Use proper event handler typing
interface FormProps {
  onSubmit: (data: JobApplicationData) => void
}

function JobForm({ onSubmit }: FormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData) as JobApplicationData
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  )
}
```

## API Route Standards

### Route Structure

```typescript
// ✅ Good: Proper API route structure
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "~/server/auth/config";
import { db } from "~/server/db";
import { Logger } from "~/lib/monitoring/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await db.jobApplication.findMany({
      where: { userId: session.user.id },
      orderBy: { appliedDate: "desc" },
    });

    Logger.info("Jobs fetched successfully", {
      userId: session.user.id,
      count: jobs.length,
    });

    return NextResponse.json({ data: jobs });
  } catch (error) {
    Logger.error("Failed to fetch jobs", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Input Validation

```typescript
// ✅ Good: Use Zod for validation
import { z } from "zod";

const createJobSchema = z.object({
  company: z.string().min(1, "Company is required").max(100),
  position: z.string().min(1, "Position is required").max(100),
  jobUrl: z.string().url().optional().or(z.literal("")),
  salary: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createJobSchema.parse(body);

    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    throw error;
  }
}
```

## Database Standards

### Prisma Queries

```typescript
// ✅ Good: Use select to limit fields
const jobs = await db.jobApplication.findMany({
  where: { userId },
  select: {
    id: true,
    company: true,
    position: true,
    status: true,
    appliedDate: true,
  },
  orderBy: { appliedDate: "desc" },
  take: 20, // Pagination
});

// ✅ Good: Use include for relations
const jobWithDetails = await db.jobApplication.findUnique({
  where: { id },
  include: {
    contacts: true,
    interviews: {
      orderBy: { scheduledAt: "asc" },
    },
  },
});

// ✅ Good: Use transactions for related operations
const result = await db.$transaction(async (tx) => {
  const job = await tx.jobApplication.create({ data: jobData });
  await tx.contact.createMany({
    data: contacts.map((contact) => ({ ...contact, jobApplicationId: job.id })),
  });
  return job;
});
```

### Error Handling

```typescript
// ✅ Good: Handle Prisma errors appropriately
try {
  const job = await db.jobApplication.create({ data });
  return job;
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new Error("Job application already exists");
    }
  }
  Logger.error("Database error", { error: error.message });
  throw new Error("Failed to create job application");
}
```

## Styling Standards

### Tailwind CSS Usage

```typescript
// ✅ Good: Use utility classes appropriately
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
  <h3 className="text-lg font-semibold text-gray-900">{job.company}</h3>
  <span className="px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
    {job.status}
  </span>
</div>

// ✅ Good: Use cn utility for conditional classes
import { cn } from '~/lib/utils'

<button
  className={cn(
    'px-4 py-2 rounded-md font-medium transition-colors',
    'bg-blue-600 text-white hover:bg-blue-700',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    isLoading && 'opacity-50 cursor-wait'
  )}
  disabled={isLoading}
>
  {isLoading ? 'Saving...' : 'Save'}
</button>
```

### Component Variants

```typescript
// ✅ Good: Use class-variance-authority for variants
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
}

export function Button({ variant, size, children, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} {...props}>
      {children}
    </button>
  )
}
```

## Testing Standards

### Unit Tests

```typescript
// ✅ Good: Descriptive test structure
describe("JobApplicationService", () => {
  describe("createJobApplication", () => {
    test("should create job application with valid data", async () => {
      // Arrange
      const userId = "user123";
      const jobData = {
        company: "TechCorp",
        position: "Software Engineer",
      };

      // Act
      const result = await createJobApplication(userId, jobData);

      // Assert
      expect(result).toMatchObject({
        company: "TechCorp",
        position: "Software Engineer",
        status: "APPLIED",
        userId: "user123",
      });
      expect(result.id).toBeDefined();
      expect(result.appliedDate).toBeInstanceOf(Date);
    });

    test("should throw ValidationError when company is missing", async () => {
      // Arrange
      const userId = "user123";
      const invalidData = { position: "Software Engineer" };

      // Act & Assert
      await expect(createJobApplication(userId, invalidData)).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
```

### Component Tests

```typescript
// ✅ Good: Test component behavior
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobCard } from './JobCard'

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    company: 'TechCorp',
    position: 'Software Engineer',
    status: 'APPLIED' as const,
    appliedDate: new Date('2024-01-15')
  }

  test('should display job information', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('TechCorp')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('APPLIED')).toBeInTheDocument()
  })

  test('should call onUpdate when status changes', async () => {
    const mockOnUpdate = jest.fn()
    render(<JobCard job={mockJob} onUpdate={mockOnUpdate} />)

    const statusButton = screen.getByRole('button', { name: /change status/i })
    fireEvent.click(statusButton)

    const interviewingOption = screen.getByText('INTERVIEWING')
    fireEvent.click(interviewingOption)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'INTERVIEWING' })
    })
  })
})
```

## Error Handling Standards

### Error Types

```typescript
// ✅ Good: Define custom error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
```

### Error Handling Patterns

```typescript
// ✅ Good: Consistent error handling
async function getJobApplication(
  id: string,
  userId: string,
): Promise<JobApplication> {
  try {
    const job = await db.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!job) {
      throw new NotFoundError("Job application", id);
    }

    return job;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-throw known errors
    }

    Logger.error("Failed to fetch job application", {
      jobId: id,
      userId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new Error("Failed to fetch job application");
  }
}
```

## Performance Standards

### React Performance

```typescript
// ✅ Good: Use React.memo for expensive components
export const JobCard = React.memo(function JobCard({ job, onUpdate }: JobCardProps) {
  // Component implementation
})

// ✅ Good: Use useMemo for expensive calculations
function JobStatistics({ jobs }: { jobs: JobApplication[] }) {
  const statistics = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter(job => job.status === 'APPLIED').length,
      interviewing: jobs.filter(job => job.status === 'INTERVIEWING').length,
      offers: jobs.filter(job => job.status === 'OFFER').length
    }
  }, [jobs])

  return <div>{/* Statistics display */}</div>
}

// ✅ Good: Use useCallback for event handlers
function JobList({ jobs, onJobUpdate }: JobListProps) {
  const handleJobUpdate = useCallback((id: string, data: Partial<JobApplication>) => {
    onJobUpdate(id, data)
  }, [onJobUpdate])

  return (
    <div>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} onUpdate={handleJobUpdate} />
      ))}
    </div>
  )
}
```

## Security Standards

### Input Sanitization

```typescript
// ✅ Good: Sanitize user input
function sanitizeJobData(input: unknown): JobApplicationData {
  const schema = z.object({
    company: z.string().trim().min(1).max(100),
    position: z.string().trim().min(1).max(100),
    notes: z.string().trim().max(1000).optional(),
  });

  return schema.parse(input);
}

// ✅ Good: Escape HTML content
function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
```

### Authentication Checks

```typescript
// ✅ Good: Consistent auth checks
async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session.user;
}

// ✅ Good: Resource ownership validation
async function requireJobOwnership(jobId: string, userId: string) {
  const job = await db.jobApplication.findFirst({
    where: { id: jobId, userId },
  });

  if (!job) {
    throw new NotFoundError("Job application", jobId);
  }

  return job;
}
```

## Documentation Standards

### Code Comments

````typescript
/**
 * Creates a new job application for the specified user.
 *
 * @param userId - The ID of the user creating the application
 * @param jobData - The job application data to create
 * @returns Promise resolving to the created job application
 * @throws {ValidationError} When the job data is invalid
 * @throws {DatabaseError} When the database operation fails
 *
 * @example
 * ```typescript
 * const job = await createJobApplication('user123', {
 *   company: 'TechCorp',
 *   position: 'Software Engineer'
 * })
 * ```
 */
async function createJobApplication(
  userId: string,
  jobData: CreateJobApplicationData,
): Promise<JobApplication> {
  // Implementation
}
````

### README Sections

- Clear project description
- Installation instructions
- Usage examples
- API documentation links
- Contributing guidelines
- License information
