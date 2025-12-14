# Database Schema Design

## Overview

Current schema includes NextAuth.js authentication models and placeholder Post model. Job application models are not yet implemented.

## Current Schema

### Authentication Models (NextAuth.js)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
}

model Account {
  id                       String  @id @default(cuid())
  userId                   String
  type                     String
  provider                 String
  providerAccountId        String
  refresh_token            String?
  access_token             String?
  expires_at               Int?
  token_type               String?
  scope                    String?
  id_token                 String?
  session_state            String?
  user                     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  refresh_token_expires_in Int?

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Placeholder Model

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  createdBy   User   @relation(fields: [createdById], references: [id])
  createdById String

  @@index([name])
}
```

## Planned Job Application Schema

Based on the form implementation, the following schema will be needed:

```prisma
model JobApplication {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // User relationship
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Role details
  roleTitle   String
  companyName String
  roleType    String
  location    String
  salary      String?

  // Timeline
  dateApplied   DateTime
  advertLink    String
  cvUsed        String?
  responseDate  DateTime?
  status        String

  // Contact information
  contactName   String?
  contactEmail  String?
  contactPhone  String?
  isLinkedInConnection Boolean @default(false)

  @@index([userId])
  @@index([dateApplied])
  @@index([status])
  @@index([companyName])
}
```

## Schema Evolution Plan

### Phase 1: Basic Job Application Model

- Add JobApplication model with all form fields
- Add relationship to User model
- Create indexes for common queries

### Phase 2: Enhanced Features

- Add application status tracking
- Add interview scheduling models
- Add document attachments

### Phase 3: Advanced Features

- Add analytics and reporting models
- Add job board integration models
- Add notification preferences

## Data Types and Constraints

### Field Mappings from Form Schema

| Form Field             | Database Type | Constraints            |
| ---------------------- | ------------- | ---------------------- |
| `roleTitle`            | `String`      | Required               |
| `companyName`          | `String`      | Required               |
| `roleType`             | `String`      | Required               |
| `location`             | `String`      | Required               |
| `salary`               | `String?`     | Optional               |
| `dateApplied`          | `DateTime`    | Required               |
| `advertLink`           | `String`      | Required, URL format   |
| `cvUsed`               | `String?`     | Optional               |
| `responseDate`         | `DateTime?`   | Optional               |
| `status`               | `String`      | Required               |
| `contactName`          | `String?`     | Optional               |
| `contactEmail`         | `String?`     | Optional, Email format |
| `contactPhone`         | `String?`     | Optional               |
| `isLinkedInConnection` | `Boolean`     | Default false          |

### Indexes Strategy

```prisma
// Performance indexes
@@index([userId])           // User's applications
@@index([dateApplied])      // Timeline queries
@@index([status])           // Status filtering
@@index([companyName])      // Company search
@@index([userId, status])   // Combined user + status
@@index([userId, dateApplied]) // User timeline
```

## Migration Strategy

### Current State

- Authentication models are production-ready
- Post model is placeholder and can be removed
- No job application data exists

### Migration Steps

1. **Remove Post model** (no data loss)
2. **Add JobApplication model** with all fields
3. **Update User model** to include jobApplications relation
4. **Run migration** with `prisma migrate dev`

### Migration Commands

```bash
# Generate migration
npx prisma migrate dev --name add-job-applications

# Apply to production
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## Data Validation

### Database Level

- Required fields enforced by schema
- Unique constraints on critical fields
- Foreign key constraints for relationships

### Application Level

- Zod schema validation (already implemented)
- URL format validation for advertLink
- Email format validation for contactEmail
- Phone format validation for contactPhone

## Performance Considerations

### Query Patterns

- **List user applications**: `WHERE userId = ?`
- **Filter by status**: `WHERE userId = ? AND status = ?`
- **Date range queries**: `WHERE dateApplied BETWEEN ? AND ?`
- **Company search**: `WHERE companyName ILIKE ?`

### Optimization

- Indexes on common query fields
- Pagination for large result sets
- Selective field loading for list views

## Security Considerations

### Row Level Security

- All queries filtered by authenticated user ID
- No cross-user data access
- Soft delete for audit trail

### Data Protection

- No sensitive data in logs
- Encrypted database connections
- Regular backup strategy

## Implementation Status

**Current**: Authentication schema only  
**Next**: Add JobApplication model and relationships  
**Future**: Enhanced features and analytics models
