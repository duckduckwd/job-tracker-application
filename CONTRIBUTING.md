# Contributing Guidelines

## Welcome

Thank you for your interest in contributing to the Job Application Tracker! This document provides guidelines and information for contributors.

## Code of Conduct

### Our Standards

- **Be respectful**: Treat all contributors with respect and kindness
- **Be inclusive**: Welcome contributors from all backgrounds and experience levels
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone is learning and growing

### Unacceptable Behaviour

- Harassment, discrimination, or offensive language
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- Docker for database setup
- Git for version control
- GitHub account

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/job-application-tracker.git`
3. Follow the [Development Setup Guide](./docs/development/setup.md)
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Branch Naming Convention

```bash
# Feature branches
feature/add-job-filtering
feature/improve-dashboard-ui

# Bug fixes
fix/authentication-redirect-issue
fix/database-connection-timeout

# Documentation
docs/update-api-documentation
docs/add-deployment-guide

# Refactoring
refactor/extract-job-service
refactor/improve-error-handling
```

### Commit Message Format

```bash
# Format: type(scope): description
feat(jobs): add job filtering by status
fix(auth): resolve OAuth callback redirect issue
docs(api): update health check endpoint documentation
refactor(db): extract database connection logic
test(jobs): add unit tests for job creation
chore(deps): update dependencies to latest versions
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **refactor**: Code refactoring without feature changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **perf**: Performance improvements
- **style**: Code style changes (formatting, etc.)

## Code Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
}

// ✅ Good: Use type assertions carefully
const element = document.getElementById("app") as HTMLElement;

// ❌ Avoid: Using 'any' type
const data: any = response.json();

// ✅ Good: Use proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  Logger.error("API call failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  throw error;
}
```

### React Component Guidelines

```typescript
// ✅ Good: Use proper component structure
interface JobCardProps {
  job: JobApplication
  onUpdate: (id: string, data: Partial<JobApplication>) => void
}

export function JobCard({ job, onUpdate }: JobCardProps) {
  const handleStatusChange = (status: ApplicationStatus) => {
    onUpdate(job.id, { status })
  }

  return (
    <div className="job-card">
      {/* Component content */}
    </div>
  )
}

// ✅ Good: Use custom hooks for logic
function useJobApplications(userId: string) {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  // Hook logic
  return { jobs, loading, refetch }
}
```

### Database Guidelines

```typescript
// ✅ Good: Use Prisma client properly
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
});

// ✅ Good: Handle database errors
try {
  const job = await db.jobApplication.create({ data });
  Logger.info("Job application created", { jobId: job.id, userId });
  return job;
} catch (error) {
  Logger.error("Failed to create job application", { error, userId });
  throw new Error("Job creation failed");
}
```

## Testing Requirements

### Test Coverage

- **Unit tests**: All utility functions and business logic
- **Integration tests**: API endpoints and database operations
- **Component tests**: React components with user interactions

### Testing Guidelines

```typescript
// ✅ Good: Descriptive test names
describe("JobApplication Service", () => {
  test("should create job application with valid data", async () => {
    const jobData = {
      company: "TechCorp",
      position: "Software Engineer",
      userId: "user123",
    };

    const result = await createJobApplication(jobData);

    expect(result).toMatchObject({
      company: "TechCorp",
      position: "Software Engineer",
      status: "APPLIED",
    });
  });

  test("should throw error when required fields are missing", async () => {
    const invalidData = { company: "TechCorp" }; // Missing position

    await expect(createJobApplication(invalidData)).rejects.toThrow(
      "Position is required",
    );
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- JobService.test.ts
```

## Pull Request Process

### Before Submitting

1. **Run tests**: Ensure all tests pass
2. **Run linting**: Fix all ESLint and Prettier issues
3. **Update documentation**: Update relevant documentation
4. **Test manually**: Verify your changes work as expected

### Pull Request Template

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new ESLint warnings
```

### Review Process

1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one approval required
3. **Testing**: Reviewer should test the changes
4. **Documentation**: Verify documentation is updated

## Issue Reporting

### Bug Reports

```markdown
## Bug Description

Clear description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behaviour

What you expected to happen.

## Actual Behaviour

What actually happened.

## Environment

- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 96.0]
- Node.js version: [e.g., 18.17.0]

## Additional Context

Screenshots, logs, or other relevant information.
```

### Feature Requests

```markdown
## Feature Description

Clear description of the proposed feature.

## Problem Statement

What problem does this feature solve?

## Proposed Solution

How should this feature work?

## Alternatives Considered

Other solutions you've considered.

## Additional Context

Mockups, examples, or other relevant information.
```

## Security Guidelines

### Reporting Security Issues

- **Do not** create public issues for security vulnerabilities
- Email security concerns to: <security@your-domain.com>
- Include detailed information about the vulnerability
- Allow reasonable time for response before public disclosure

### Security Best Practices

- Never commit secrets or credentials
- Use environment variables for sensitive configuration
- Validate all user inputs
- Follow OWASP security guidelines
- Keep dependencies updated

## Documentation Standards

### Code Documentation

```typescript
/**
 * Creates a new job application for the specified user.
 *
 * @param userId - The ID of the user creating the application
 * @param jobData - The job application data
 * @returns Promise resolving to the created job application
 * @throws {ValidationError} When required fields are missing
 * @throws {DatabaseError} When database operation fails
 */
async function createJobApplication(
  userId: string,
  jobData: CreateJobApplicationData,
): Promise<JobApplication> {
  // Implementation
}
```

### API Documentation

- Update OpenAPI/Swagger documentation for API changes
- Include request/response examples
- Document error responses
- Update rate limiting information

### README Updates

- Keep installation instructions current
- Update feature lists
- Maintain troubleshooting section
- Update screenshots when UI changes

## Performance Guidelines

### Code Performance

- Use React.memo for expensive components
- Implement proper loading states
- Optimise database queries
- Use pagination for large datasets

### Bundle Size

- Monitor bundle size with each change
- Use dynamic imports for large dependencies
- Optimise images and assets
- Remove unused dependencies

## Accessibility Guidelines

### WCAG Compliance

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain proper color contrast ratios

### Testing Accessibility

```bash
# Run accessibility tests
npm run test:a11y

# Use accessibility linting
npm run lint:a11y
```

## Release Process

### Version Numbering

- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Security review completed
- [ ] Performance impact assessed

## Getting Help

### Resources

- [Development Setup Guide](./docs/development/setup.md)
- [API Documentation](./docs/api/README.md)
- [Architecture Documentation](./docs/adr/)

### Communication

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Pull Request Comments**: Code-specific discussions

### Mentorship

New contributors are welcome! Don't hesitate to:

- Ask questions in discussions
- Request code reviews
- Seek guidance on best practices
- Participate in architectural discussions

## Recognition

### Contributors

All contributors will be recognised in:

- README.md contributors section
- Release notes
- Project documentation

### Types of Contributions

We value all types of contributions:

- Code contributions
- Documentation improvements
- Bug reports and testing
- Design and UX feedback
- Community support and mentoring

Thank you for contributing to the Job Application Tracker! 🚀
