# Modern CRM System - Technical Specification v1.0

## Executive Summary

A modern, minimal CRM system built for small-to-medium teams (up to ~100 users) with focus on simplicity, security, and extensibility. The system manages customer relationships through Organizations, Accounts, Sales Opportunities, Projects, and Tasks with comprehensive activity tracking.

**Target Scale:** ~100 users, 3-year runway  
**Architecture:** Monolithic Next.js App Router with Server Components  
**Deployment:** Docker + GitHub Actions → GHCR

---

## 1. Technology Stack

### Core Framework
- **Next.js 15+** (App Router, React Server Components)
- **TypeScript 5+** (Strict mode)
- **React 19+**

### Backend
- **Prisma ORM** (Latest)
- **SQLite** (Development)
- **PostgreSQL 16+** (Production)
- **Better-Auth** (Authentication with JWT strategy)

### Validation & Type Safety
- **Zod** (Schema validation)
- **TypeScript** (End-to-end type safety)

### UI Framework
- **Tailwind CSS 3+**
- **shadcn/ui** (Component library)
- **Radix UI** (Primitives)
- **Lucide React** (Icons)

### Additional Libraries
- **next-intl** (Internationalization)
- **Recharts** (Analytics & Reports - v2)
- **cmdk** (Command palette for search)
- **@upstash/ratelimit** (Rate limiting)

### Development Tools
- **Vitest** (Unit testing)
- **Playwright** (E2E testing)
- **ESLint + Prettier** (Code quality)
- **Husky** (Git hooks)

---

## 2. System Architecture

### 2.1 Multi-Tenancy Strategy

**Row-Level Security (RLS) with Prisma Middleware**

- Single database with `organizationId` on every tenant-scoped table
- Automatic filtering via Prisma middleware
- PostgreSQL RLS policies for additional security layer (production)

```typescript
// prisma/middleware/tenancy.ts
prisma.$use(async (params, next) => {
  const orgId = getOrgIdFromContext()
  
  if (TENANT_SCOPED_MODELS.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        organizationId: orgId,
      }
    }
  }
  
  return next(params)
})
```

### 2.2 Entity Hierarchy

```
Organization (Your Company)
  ├─ Users (Roles: SUPER_ADMIN, OWNER, ADMIN, USER)
  ├─ Accounts (Customer/Client Companies)
  │   ├─ Contacts (People at customer company)
  │   ├─ Deals (Sales Opportunities/Pipeline)
  │   └─ Projects
  │       └─ Tasks
  │           ├─ Subtasks
  │           └─ Activities
  └─ Activities (Audit log, linked to any entity)
```

**Key Relationships:**
- User belongs to Organization with a Role
- User can be member of multiple Accounts
- Account has many Projects
- Project has many Tasks
- Task has many Subtasks
- All entities have Activities

---

## 3. Database Schema (Prisma)

### 3.1 Core Models

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // sqlite for dev
  url      = env("DATABASE_URL")
}

// ============================================
// SYSTEM & AUTH
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  
  // Auth
  hashedPassword String?
  
  // Organization membership
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  role           UserRole
  
  // Account memberships
  accountMemberships AccountMember[]
  
  // Assignments
  assignedTasks  Task[]    @relation("TaskAssignee")
  assignedDeals  Deal[]    @relation("DealAssignee")
  
  // Audit fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Soft delete
  deletedAt     DateTime?
  
  // Activity tracking
  activitiesPerformed Activity[] @relation("ActivityPerformer")
  
  @@index([organizationId])
  @@index([email])
}

enum UserRole {
  SUPER_ADMIN
  OWNER
  ADMIN
  USER
}

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  
  // Optional details
  industry    String?
  size        String?
  website     String?
  logoUrl     String?
  
  // Relations
  users       User[]
  accounts    Account[]
  deals       Deal[]
  projects    Project[]
  tasks       Task[]
  activities  Activity[]
  
  // Settings
  settings    OrganizationSettings?
  
  // Audit
  createdAt   DateTime @default(now())
  createdBy   String?
  updatedAt   DateTime @updatedAt
  updatedBy   String?
  deletedAt   DateTime?
  
  @@index([slug])
}

model OrganizationSettings {
  id             String  @id @default(cuid())
  organizationId String  @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Timezone & locale
  timezone       String  @default("UTC")
  locale         String  @default("en")
  currency       String  @default("USD")
  
  // Feature flags
  enableProjects Boolean @default(true)
  enableDeals    Boolean @default(true)
  
  updatedAt      DateTime @updatedAt
}

// ============================================
// CRM ENTITIES
// ============================================

model Account {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Basic info
  name           String
  description    String?
  website        String?
  
  // Contact info
  email          String?
  phone          String?
  
  // Address
  address        String?
  city           String?
  state          String?
  postalCode     String?
  country        String?
  
  // Relations
  contacts       Contact[]
  deals          Deal[]
  projects       Project[]
  members        AccountMember[]
  activities     Activity[]
  
  // Audit
  createdAt      DateTime @default(now())
  createdBy      String
  updatedAt      DateTime @updatedAt
  updatedBy      String?
  deletedAt      DateTime?
  
  @@index([organizationId])
  @@index([organizationId, name])
  @@fulltext([name, description])
}

model AccountMember {
  id        String  @id @default(cuid())
  accountId String
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  addedAt   DateTime @default(now())
  addedBy   String?
  
  @@unique([accountId, userId])
  @@index([userId])
}

model Contact {
  id             String   @id @default(cuid())
  accountId      String
  account        Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  organizationId String   // Denormalized for query performance
  
  // Personal info
  firstName      String
  lastName       String
  email          String?
  phone          String?
  position       String?
  
  // Relations
  activities     Activity[]
  
  // Audit
  createdAt      DateTime @default(now())
  createdBy      String
  updatedAt      DateTime @updatedAt
  updatedBy      String?
  deletedAt      DateTime?
  
  @@index([accountId])
  @@index([organizationId])
  @@fulltext([firstName, lastName, email])
}

model Deal {
  id             String    @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  accountId      String
  account        Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  // Basic info
  title          String
  description    String?
  
  // Financial
  value          Decimal?  @db.Decimal(15, 2)
  currency       String    @default("USD")
  
  // Pipeline
  stage          DealStage @default(LEAD)
  probability    Int?      // 0-100
  expectedCloseDate DateTime?
  actualCloseDate   DateTime?
  
  // Assignment
  assignedToId   String?
  assignedTo     User?     @relation("DealAssignee", fields: [assignedToId], references: [id])
  
  // Relations
  activities     Activity[]
  
  // Audit
  createdAt      DateTime  @default(now())
  createdBy      String
  updatedAt      DateTime  @updatedAt
  updatedBy      String?
  deletedAt      DateTime?
  
  @@index([organizationId])
  @@index([accountId])
  @@index([stage])
  @@index([organizationId, stage])
  @@fulltext([title, description])
}

enum DealStage {
  LEAD
  QUALIFIED
  PROPOSAL
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

model Project {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  accountId      String
  account        Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  // Basic info
  name           String
  description    String?
  
  // Status
  status         ProjectStatus @default(PLANNING)
  
  // Dates
  startDate      DateTime?
  endDate        DateTime?
  
  // Relations
  tasks          Task[]
  activities     Activity[]
  
  // Audit
  createdAt      DateTime @default(now())
  createdBy      String
  updatedAt      DateTime @updatedAt
  updatedBy      String?
  deletedAt      DateTime?
  
  @@index([organizationId])
  @@index([accountId])
  @@index([organizationId, accountId])
  @@fulltext([name, description])
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

model Task {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  projectId      String
  project        Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Basic info
  title          String
  description    String?
  
  // Status & Priority
  status         TaskStatus   @default(TODO)
  priority       TaskPriority @default(MEDIUM)
  
  // Assignment
  assignedToId   String?
  assignedTo     User?        @relation("TaskAssignee", fields: [assignedToId], references: [id])
  
  // Dates
  dueDate        DateTime?
  completedAt    DateTime?
  
  // Relations
  subtasks       Subtask[]
  activities     Activity[]
  
  // Audit
  createdAt      DateTime @default(now())
  createdBy      String
  updatedAt      DateTime @updatedAt
  updatedBy      String?
  deletedAt      DateTime?
  
  @@index([organizationId])
  @@index([projectId])
  @@index([assignedToId])
  @@index([status])
  @@index([organizationId, status])
  @@fulltext([title, description])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  BLOCKED
  REVIEW
  COMPLETED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Subtask {
  id          String      @id @default(cuid())
  taskId      String
  task        Task        @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  title       String
  completed   Boolean     @default(false)
  
  // Relations
  activities  Activity[]
  
  // Audit
  createdAt   DateTime    @default(now())
  createdBy   String
  updatedAt   DateTime    @updatedAt
  completedAt DateTime?
  
  @@index([taskId])
}

// ============================================
// ACTIVITY & AUDIT LOG
// ============================================

model Activity {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Polymorphic relation (entity this activity belongs to)
  entityType     EntityType
  entityId       String
  
  // Activity details
  activityType   ActivityType
  description    String?      // Human-readable description
  metadata       Json?        // Flexible storage for additional data
  
  // Relations (optional, for easier queries)
  accountId      String?
  account        Account?     @relation(fields: [accountId], references: [id], onDelete: Cascade)
  contactId      String?
  contact        Contact?     @relation(fields: [contactId], references: [id], onDelete: Cascade)
  dealId         String?
  deal           Deal?        @relation(fields: [dealId], references: [id], onDelete: Cascade)
  projectId      String?
  project        Project?     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  taskId         String?
  task           Task?        @relation(fields: [taskId], references: [id], onDelete: Cascade)
  subtaskId      String?
  subtask        Subtask?     @relation(fields: [subtaskId], references: [id], onDelete: Cascade)
  
  // Performer
  performedById  String
  performedBy    User         @relation("ActivityPerformer", fields: [performedById], references: [id])
  performedAt    DateTime     @default(now())
  
  // Security tracking
  ipAddress      String?
  userAgent      String?
  
  @@index([organizationId])
  @@index([entityType, entityId])
  @@index([accountId])
  @@index([projectId])
  @@index([taskId])
  @@index([performedById])
  @@index([organizationId, performedAt])
}

enum EntityType {
  ORGANIZATION
  USER
  ACCOUNT
  CONTACT
  DEAL
  PROJECT
  TASK
  SUBTASK
}

enum ActivityType {
  // Generic
  CREATED
  UPDATED
  DELETED
  VIEWED
  
  // Comments
  COMMENTED
  
  // CRM specific
  NOTE_ADDED
  CALL_INBOUND
  CALL_OUTBOUND
  EMAIL_SENT
  EMAIL_RECEIVED
  MEETING_SCHEDULED
  
  // Task specific
  TASK_ASSIGNED
  TASK_UNASSIGNED
  TASK_STATUS_CHANGED
  TASK_PRIORITY_CHANGED
  TASK_COMPLETED
  TASK_REOPENED
  
  // Project specific
  PROJECT_MEMBER_ADDED
  PROJECT_MEMBER_REMOVED
  PROJECT_STATUS_CHANGED
  
  // Deal specific
  DEAL_STAGE_CHANGED
  DEAL_VALUE_CHANGED
  DEAL_WON
  DEAL_LOST
  
  // Account specific
  ACCOUNT_MEMBER_ADDED
  ACCOUNT_MEMBER_REMOVED
}

// ============================================
// SYSTEM
// ============================================

model SystemSettings {
  id                 String   @id @default("global")
  
  // Maintenance
  maintenanceMode    Boolean  @default(false)
  maintenanceMessage String?
  maintenanceStart   DateTime?
  maintenanceEnd     DateTime?
  
  // System messages
  systemMessage      String?
  systemMessageType  SystemMessageType?
  systemMessageActive Boolean @default(false)
  
  updatedAt          DateTime @updatedAt
  updatedBy          String?
}

enum SystemMessageType {
  INFO
  WARNING
  ERROR
  SUCCESS
}

// ============================================
// FUTURE: WEBHOOKS (V2)
// ============================================

model Webhook {
  id             String   @id @default(cuid())
  organizationId String
  
  name           String
  url            String
  events         String[] // ["account.created", "task.updated"]
  secret         String   // For signature verification
  active         Boolean  @default(true)
  
  // Stats
  lastTriggeredAt DateTime?
  failureCount   Int      @default(0)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([organizationId])
}
```

### 3.2 Database Indexes Strategy

**Performance-critical indexes:**

```sql
-- Full-text search indexes (PostgreSQL)
CREATE INDEX idx_accounts_search ON accounts 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_projects_search ON projects 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_tasks_search ON tasks 
USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Composite indexes for common queries
CREATE INDEX idx_tasks_org_status ON tasks(organization_id, status);
CREATE INDEX idx_activities_org_date ON activities(organization_id, performed_at DESC);
CREATE INDEX idx_deals_org_stage ON deals(organization_id, stage);
```

---

## 4. Authentication & Authorization

### 4.1 Authentication (Better-Auth)

**Setup:**

```typescript
// lib/auth/config.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    // V2: Add Google, GitHub, Microsoft
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  jwt: {
    enabled: true,
  },
})
```

### 4.2 Claims-Based Authorization

**User Claims Structure:**

```typescript
// types/auth.ts
export interface UserClaims {
  userId: string
  organizationId: string
  role: UserRole
  accountIds: string[] // Accounts user is member of
  permissions: Permission[]
  email: string
  name: string
}

export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'USER'
```

**Permission System:**

```typescript
// lib/auth/permissions.ts
export type Permission = 
  // Format: entity:action or entity:action:scope
  
  // Organization
  | 'organization:read'
  | 'organization:update'
  | 'organization:delete'
  | 'organization:manage_users'
  
  // Account
  | 'account:create'
  | 'account:read:all'      // All accounts in org
  | 'account:read:own'      // Only accounts user is member of
  | 'account:update:all'
  | 'account:update:own'
  | 'account:delete:all'
  | 'account:delete:own'
  
  // Contact
  | 'contact:create'
  | 'contact:read'
  | 'contact:update'
  | 'contact:delete'
  
  // Deal
  | 'deal:create'
  | 'deal:read:all'
  | 'deal:read:assigned'
  | 'deal:update:all'
  | 'deal:update:assigned'
  | 'deal:delete:all'
  
  // Project
  | 'project:create'
  | 'project:read:all'
  | 'project:read:member'
  | 'project:update:all'
  | 'project:update:member'
  | 'project:delete:all'
  
  // Task
  | 'task:create'
  | 'task:read'
  | 'task:update:all'
  | 'task:update:assigned'
  | 'task:delete:all'
  | 'task:assign'
  
  // Activity
  | 'activity:create'
  | 'activity:read'
  
  // System
  | 'system:manage_settings'
  | 'system:view_logs'

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    // Full access to everything
    'organization:read',
    'organization:update',
    'organization:delete',
    'organization:manage_users',
    'account:create',
    'account:read:all',
    'account:update:all',
    'account:delete:all',
    'contact:create',
    'contact:read',
    'contact:update',
    'contact:delete',
    'deal:create',
    'deal:read:all',
    'deal:update:all',
    'deal:delete:all',
    'project:create',
    'project:read:all',
    'project:update:all',
    'project:delete:all',
    'task:create',
    'task:read',
    'task:update:all',
    'task:delete:all',
    'task:assign',
    'activity:create',
    'activity:read',
    'system:manage_settings',
    'system:view_logs',
  ],
  
  OWNER: [
    'organization:read',
    'organization:update',
    'organization:manage_users',
    'account:create',
    'account:read:all',
    'account:update:all',
    'account:delete:all',
    'contact:create',
    'contact:read',
    'contact:update',
    'contact:delete',
    'deal:create',
    'deal:read:all',
    'deal:update:all',
    'deal:delete:all',
    'project:create',
    'project:read:all',
    'project:update:all',
    'project:delete:all',
    'task:create',
    'task:read',
    'task:update:all',
    'task:delete:all',
    'task:assign',
    'activity:create',
    'activity:read',
    'system:manage_settings',
  ],
  
  ADMIN: [
    'organization:read',
    'account:create',
    'account:read:all',
    'account:update:all',
    'account:delete:own',
    'contact:create',
    'contact:read',
    'contact:update',
    'contact:delete',
    'deal:create',
    'deal:read:all',
    'deal:update:all',
    'deal:delete:all',
    'project:create',
    'project:read:all',
    'project:update:all',
    'task:create',
    'task:read',
    'task:update:all',
    'task:assign',
    'activity:create',
    'activity:read',
  ],
  
  USER: [
    'organization:read',
    'account:read:own',
    'contact:read',
    'deal:read:assigned',
    'deal:update:assigned',
    'project:read:member',
    'project:update:member',
    'task:create',
    'task:read',
    'task:update:assigned',
    'activity:create',
    'activity:read',
  ],
}

// Permission checker
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

// Permission checker with context
export function canAccessAccount(
  user: UserClaims,
  accountId: string
): boolean {
  if (hasPermission(user.role, 'account:read:all')) {
    return true
  }
  
  if (hasPermission(user.role, 'account:read:own')) {
    return user.accountIds.includes(accountId)
  }
  
  return false
}
```

### 4.3 Organization Context Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for public routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/docs'
  ) {
    return NextResponse.next()
  }
  
  // Check disaster mode (ENV)
  if (process.env.DISASTER_MODE === 'true') {
    return NextResponse.redirect(new URL('/disaster', request.url))
  }
  
  // Get session
  const session = await auth.api.getSession({ headers: request.headers })
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Validate organization context
  const organizationId = session.user.organizationId
  if (!organizationId && pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
  
  // Add user claims to headers for Server Components
  const response = NextResponse.next()
  response.headers.set('x-user-id', session.user.id)
  response.headers.set('x-organization-id', organizationId)
  response.headers.set('x-user-role', session.user.role)
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 4.4 Server Action Authorization

```typescript
// lib/auth/action-auth.ts
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  const organizationId = headersList.get('x-organization-id')
  const role = headersList.get('x-user-role') as UserRole
  
  if (!userId || !organizationId) {
    redirect('/auth/login')
  }
  
  return {
    userId,
    organizationId,
    role,
  }
}

export async function requirePermission(permission: Permission) {
  const { role } = await requireAuth()
  
  if (!hasPermission(role, permission)) {
    throw new Error('Unauthorized')
  }
}

// Usage in Server Actions
export async function deleteAccount(accountId: string) {
  'use server'
  
  const { userId, organizationId, role } = await requireAuth()
  await requirePermission('account:delete:all')
  
  // Check if user has access to this specific account
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      organizationId,
    },
  })
  
  if (!account) {
    throw new Error('Account not found')
  }
  
  // Perform deletion...
}
```

---

## 5. API Layer (Server Actions)

All data mutations use Next.js Server Actions instead of traditional API routes.

### 5.1 Server Action Structure

```typescript
// lib/actions/accounts.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/auth/action-auth'
import { createActivity } from './activities'

// Validation schemas
const createAccountSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

const updateAccountSchema = createAccountSchema.partial()

// CREATE
export async function createAccount(data: z.infer<typeof createAccountSchema>) {
  const { userId, organizationId } = await requireAuth()
  await requirePermission('account:create')
  
  // Validate input
  const validated = createAccountSchema.parse(data)
  
  // Create account
  const account = await prisma.account.create({
    data: {
      ...validated,
      organizationId,
      createdBy: userId,
    },
  })
  
  // Log activity
  await createActivity({
    entityType: 'ACCOUNT',
    entityId: account.id,
    activityType: 'CREATED',
    description: `Account "${account.name}" created`,
    accountId: account.id,
  })
  
  revalidatePath('/app/accounts')
  return { success: true, data: account }
}

// READ (List with filters)
export async function getAccounts(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const { organizationId, role } = await requireAuth()
  await requirePermission('account:read:all')
  
  const { search, page = 1, limit = 25 } = params || {}
  const skip = (page - 1) * limit
  
  const where = {
    organizationId,
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }
  
  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            contacts: true,
            deals: true,
            projects: true,
          },
        },
      },
    }),
    prisma.account.count({ where }),
  ])
  
  return {
    data: accounts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

// READ (Single)
export async function getAccount(accountId: string) {
  const { organizationId } = await requireAuth()
  
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      organizationId,
      deletedAt: null,
    },
    include: {
      contacts: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      deals: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      projects: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  })
  
  if (!account) {
    throw new Error('Account not found')
  }
  
  return account
}

// UPDATE
export async function updateAccount(
  accountId: string,
  data: z.infer<typeof updateAccountSchema>
) {
  const { userId, organizationId } = await requireAuth()
  await requirePermission('account:update:all')
  
  const validated = updateAccountSchema.parse(data)
  
  const account = await prisma.account.update({
    where: {
      id: accountId,
      organizationId,
    },
    data: {
      ...validated,
      updatedBy: userId,
    },
  })
  
  await createActivity({
    entityType: 'ACCOUNT',
    entityId: account.id,
    activityType: 'UPDATED',
    description: `Account "${account.name}" updated`,
    accountId: account.id,
  })
  
  revalidatePath('/app/accounts')
  revalidatePath(`/app/accounts/${accountId}`)
  return { success: true, data: account }
}

// DELETE (Soft delete)
export async function deleteAccount(accountId: string) {
  const { userId, organizationId } = await requireAuth()
  await requirePermission('account:delete:all')
  
  const account = await prisma.account.update({
    where: {
      id: accountId,
      organizationId,
    },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  })
  
  await createActivity({
    entityType: 'ACCOUNT',
    entityId: account.id,
    activityType: 'DELETED',
    description: `Account "${account.name}" deleted`,
    accountId: account.id,
  })
  
  revalidatePath('/app/accounts')
  return { success: true }
}

// ADD MEMBER
export async function addAccountMember(accountId: string, userId: string) {
  const { userId: currentUserId, organizationId } = await requireAuth()
  await requirePermission('account:update:all')
  
  // Verify user belongs to same org
  const user = await prisma.user.findFirst({
    where: { id: userId, organizationId },
  })
  
  if (!user) {
    throw new Error('User not found in organization')
  }
  
  await prisma.accountMember.create({
    data: {
      accountId,
      userId,
      addedBy: currentUserId,
    },
  })
  
  await createActivity({
    entityType: 'ACCOUNT',
    entityId: accountId,
    activityType: 'ACCOUNT_MEMBER_ADDED',
    description: `${user.name} added to account`,
    accountId,
  })
  
  revalidatePath(`/app/accounts/${accountId}`)
  return { success: true }
}
```

### 5.2 Activity/Audit Actions

```typescript
// lib/actions/activities.ts
'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/action-auth'
import type { EntityType, ActivityType } from '@prisma/client'

export async function createActivity(data: {
  entityType: EntityType
  entityId: string
  activityType: ActivityType
  description?: string
  metadata?: Record<string, any>
  accountId?: string
  contactId?: string
  dealId?: string
  projectId?: string
  taskId?: string
  subtaskId?: string
}) {
  const { userId, organizationId } = await requireAuth()
  
  // Get request metadata
  const { headers } = await import('next/headers')
  const headersList = headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')
  
  await prisma.activity.create({
    data: {
      ...data,
      organizationId,
      performedById: userId,
      ipAddress,
      userAgent,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  })
}

export async function getActivities(params: {
  entityType?: EntityType
  entityId?: string
  accountId?: string
  projectId?: string
  limit?: number
  page?: number
}) {
  const { organizationId } = await requireAuth()
  
  const { entityType, entityId, accountId, projectId, limit = 50, page = 1 } = params
  const skip = (page - 1) * limit
  
  const where = {
    organizationId,
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(accountId && { accountId }),
    ...(projectId && { projectId }),
  }
  
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { performedAt: 'desc' },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
    prisma.activity.count({ where }),
  ])
  
  return {
    data: activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}
```

### 5.3 Project & Task Actions

```typescript
// lib/actions/projects.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/auth/action-auth'
import { createActivity } from './activities'

const createProjectSchema = z.object({
  accountId: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export async function createProject(data: z.infer<typeof createProjectSchema>) {
  const { userId, organizationId } = await requireAuth()
  await requirePermission('project:create')
  
  const validated = createProjectSchema.parse(data)
  
  // Verify account exists and belongs to org
  const account = await prisma.account.findFirst({
    where: {
      id: validated.accountId,
      organizationId,
    },
  })
  
  if (!account) {
    throw new Error('Account not found')
  }
  
  const project = await prisma.project.create({
    data: {
      ...validated,
      organizationId,
      createdBy: userId,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
    },
  })
  
  await createActivity({
    entityType: 'PROJECT',
    entityId: project.id,
    activityType: 'CREATED',
    description: `Project "${project.name}" created`,
    accountId: account.id,
    projectId: project.id,
  })
  
  revalidatePath('/app/projects')
  revalidatePath(`/app/accounts/${validated.accountId}`)
  return { success: true, data: project }
}

// Get projects by account
export async function getProjectsByAccount(accountId: string) {
  const { organizationId } = await requireAuth()
  
  const projects = await prisma.project.findMany({
    where: {
      accountId,
      organizationId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  })
  
  return projects
}

// Get project with tasks and subtasks
export async function getProjectWithTasks(projectId: string) {
  const { organizationId } = await requireAuth()
  
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },
    include: {
      account: {
        select: {
          id: true,
          name: true,
        },
      },
      tasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          subtasks: {
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: {
              activities: true,
            },
          },
        },
      },
    },
  })
  
  if (!project) {
    throw new Error('Project not found')
  }
  
  return project
}
```

```typescript
// lib/actions/tasks.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/auth/action-auth'
import { createActivity } from './activities'

const createTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedToId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

export async function createTask(data: z.infer<typeof createTaskSchema>) {
  const { userId, organizationId } = await requireAuth()
  await requirePermission('task:create')
  
  const validated = createTaskSchema.parse(data)
  
  // Verify project exists
  const project = await prisma.project.findFirst({
    where: {
      id: validated.projectId,
      organizationId,
    },
    include: {
      account: true,
    },
  })
  
  if (!project) {
    throw new Error('Project not found')
  }
  
  const task = await prisma.task.create({
    data: {
      ...validated,
      organizationId,
      createdBy: userId,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
    },
  })
  
  await createActivity({
    entityType: 'TASK',
    entityId: task.id,
    activityType: 'CREATED',
    description: `Task "${task.title}" created`,
    accountId: project.accountId,
    projectId: project.id,
    taskId: task.id,
  })
  
  revalidatePath(`/app/projects/${validated.projectId}`)
  return { success: true, data: task }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const { userId, organizationId } = await requireAuth()
  
  const task = await prisma.task.update({
    where: {
      id: taskId,
      organizationId,
    },
    data: {
      status: status as any,
      updatedBy: userId,
      ...(status === 'COMPLETED' && { completedAt: new Date() }),
    },
    include: {
      project: true,
    },
  })
  
  await createActivity({
    entityType: 'TASK',
    entityId: task.id,
    activityType: 'TASK_STATUS_CHANGED',
    description: `Task status changed to ${status}`,
    accountId: task.project.accountId,
    projectId: task.projectId,
    taskId: task.id,
    metadata: { oldStatus: task.status, newStatus: status },
  })
  
  revalidatePath(`/app/projects/${task.projectId}`)
  return { success: true }
}

export async function assignTask(taskId: string, assignedToId: string) {
  const { userId, organizationId } = await requireAuth()
  await requirePermission('task:assign')
  
  // Verify assignee is in same org
  const assignee = await prisma.user.findFirst({
    where: {
      id: assignedToId,
      organizationId,
    },
  })
  
  if (!assignee) {
    throw new Error('User not found')
  }
  
  const task = await prisma.task.update({
    where: {
      id: taskId,
      organizationId,
    },
    data: {
      assignedToId,
      updatedBy: userId,
    },
    include: {
      project: true,
    },
  })
  
  await createActivity({
    entityType: 'TASK',
    entityId: task.id,
    activityType: 'TASK_ASSIGNED',
    description: `Task assigned to ${assignee.name}`,
    accountId: task.project.accountId,
    projectId: task.projectId,
    taskId: task.id,
  })
  
  revalidatePath(`/app/projects/${task.projectId}`)
  return { success: true }
}

// Create subtask
export async function createSubtask(taskId: string, title: string) {
  const { userId, organizationId } = await requireAuth()
  
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId,
    },
    include: {
      project: true,
    },
  })
  
  if (!task) {
    throw new Error('Task not found')
  }
  
  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title,
      createdBy: userId,
    },
  })
  
  await createActivity({
    entityType: 'SUBTASK',
    entityId: subtask.id,
    activityType: 'CREATED',
    description: `Subtask "${title}" created`,
    accountId: task.project.accountId,
    projectId: task.projectId,
    taskId: task.id,
    subtaskId: subtask.id,
  })
  
  revalidatePath(`/app/projects/${task.projectId}`)
  return { success: true, data: subtask }
}

// Toggle subtask completion
export async function toggleSubtask(subtaskId: string) {
  const { userId, organizationId } = await requireAuth()
  
  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      task: {
        organizationId,
      },
    },
    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
  })
  
  if (!subtask) {
    throw new Error('Subtask not found')
  }
  
  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      completed: !subtask.completed,
      completedAt: !subtask.completed ? new Date() : null,
      updatedBy: userId,
    },
  })
  
  revalidatePath(`/app/projects/${subtask.task.projectId}`)
  return { success: true, data: updated }
}
```

### 5.4 Global Search Action

```typescript
// lib/actions/search.ts
'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/action-auth'

export async function globalSearch(query: string, limit: number = 20) {
  const { organizationId } = await requireAuth()
  
  if (!query || query.length < 2) {
    return { results: [] }
  }
  
  const searchTerm = `%${query}%`
  
  // Search accounts
  const accounts = await prisma.account.findMany({
    where: {
      organizationId,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
    },
  })
  
  // Search contacts
  const contacts = await prisma.contact.findMany({
    where: {
      organizationId,
      deletedAt: null,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      account: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
  
  // Search projects
  const projects = await prisma.project.findMany({
    where: {
      organizationId,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      name: true,
      status: true,
      account: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
  
  // Search tasks
  const tasks = await prisma.task.findMany({
    where: {
      organizationId,
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true,
      project: {
        select: {
          id: true,
          name: true,
          account: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })
  
  // Format results
  const results = [
    ...accounts.map(a => ({
      id: a.id,
      type: 'account' as const,
      title: a.name,
      subtitle: a.email,
      url: `/app/accounts/${a.id}`,
    })),
    ...contacts.map(c => ({
      id: c.id,
      type: 'contact' as const,
      title: `${c.firstName} ${c.lastName}`,
      subtitle: `${c.account.name} • ${c.email}`,
      url: `/app/accounts/${c.account.id}`,
    })),
    ...projects.map(p => ({
      id: p.id,
      type: 'project' as const,
      title: p.name,
      subtitle: `${p.account.name} • ${p.status}`,
      url: `/app/projects/${p.id}`,
    })),
    ...tasks.map(t => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      subtitle: `${t.project.account.name} • ${t.project.name}`,
      url: `/app/projects/${t.project.id}`,
    })),
  ]
  
  return { results: results.slice(0, limit) }
}
```

---

## 6. UI/UX Specifications

### 6.1 Design System Implementation

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (inspired by Fiken but adjusted)
        primary: {
          50: '#f8fafe',
          100: '#ecf4ff',
          200: '#e5eefb',
          300: '#aecdf9',
          400: '#AECDF9', // Main brand color
          500: '#75abf7',
          600: '#5a96f5',
          700: '#3471cb',
          800: '#2a5ba8',
          900: '#1656a0',
          950: '#003068',
        },
        // Semantic colors
        success: {
          DEFAULT: '#6BD1B7',
          50: '#eaf9f4',
          100: '#dbf7ef',
          200: '#b5ecde',
          300: '#6BD1B7',
          400: '#00997d',
          500: '#008069',
          600: '#006a57',
        },
        warning: {
          DEFAULT: '#FFE86F',
          50: '#fdf6d3',
          100: '#faeb99',
          200: '#FFE86F',
          300: '#f1d01f',
          400: '#e0a206',
          500: '#b37e14',
          600: '#684000',
        },
        error: {
          DEFAULT: '#F28F88',
          50: '#ffebe8',
          100: '#ffdbd4',
          200: '#F28F88',
          300: '#C90000',
          400: '#960000',
        },
        // Neutrals
        background: '#f9f9fb',
        surface: '#ffffff',
        border: '#dee0e5',
        muted: '#eff0f3',
        'black-blue': {
          50: '#f9f9fb',
          100: '#f4f5f8',
          150: '#eff0f3',
          200: '#dee0e5',
          300: '#c7cad2',
          400: '#aeb2bd',
          500: '#8f94a3',
          600: '#6e7487',
          700: '#4f5667',
          800: '#383e4c',
          900: '#272d3a',
        },
      },
      spacing: {
        '2': '2px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '6px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Light mode */
  --background: #f9f9fb;
  --surface: #ffffff;
  --surface-raised: #ffffff;
  --border: #dee0e5;
  --text-primary: #272d3a;
  --text-secondary: #4f5667;
  --text-tertiary: #8f94a3;
  --text-inverse: #ffffff;
}

[data-theme='dark'] {
  --background: #1a1a1a;
  --surface: #262626;
  --surface-raised: #2d2d2d;
  --border: #3d3d3d;
  --text-primary: #ffffff;
  --text-secondary: #d4d4d4;
  --text-tertiary: #a3a3a3;
  --text-inverse: #1a1a1a;
}

@layer base {
  body {
    @apply bg-background text-black-blue-900 dark:bg-black-blue-900 dark:text-white;
  }
}
```

### 6.2 Page Layout Components

```typescript
// components/layouts/page-header.tsx
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  stats?: Array<{
    label: string
    value: string | number
    trend?: string
  }>
}

export function PageHeader({ title, subtitle, action, stats }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-surface px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        
        {action && (
          <Button onClick={action.onClick}>
            {action.icon || <PlusIcon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
      
      {stats && stats.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-surface-raised p-4"
            >
              <p className="text-sm text-text-secondary">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                {stat.value}
              </p>
              {stat.trend && (
                <p className="mt-1 text-xs text-success">{stat.trend}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

```typescript
// components/layouts/page-content.tsx
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchIcon, FilterIcon } from 'lucide-react'

interface PageContentProps {
  children: React.ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: Array<{
    label: string
    value: string
    options: Array<{ label: string; value: string }>
    onChange: (value: string) => void
  }>
  viewMode?: 'list' | 'grid' | 'table'
  onViewModeChange?: (mode: 'list' | 'grid' | 'table') => void
}

export function PageContent({
  children,
  searchValue,
  onSearchChange,
  filters,
  viewMode = 'table',
  onViewModeChange,
}: PageContentProps) {
  return (
    <div className="flex-1 overflow-auto">
      {/* Filters & Search Bar */}
      {(onSearchChange || filters) && (
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-6 py-4">
          <div className="flex items-center gap-4">
            {onSearchChange && (
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
            
            {filters && filters.length > 0 && (
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4 text-text-tertiary" />
                {filters.map((filter, index) => (
                  <Select key={index} {...filter} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="p-6">{children}</div>
    </div>
  )
}
```

### 6.3 Empty States

```typescript
// components/ui/empty-state.tsx
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted py-12">
      <Icon className="h-12 w-12 text-text-tertiary" />
      <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

### 6.4 Command Palette (Global Search)

```typescript
// components/command-palette.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { globalSearch } from '@/lib/actions/search'
import { 
  BuildingIcon, 
  UserIcon, 
  FolderIcon, 
  CheckSquareIcon 
} from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Cmd+K or Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  
  // Search as user types
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    
    const search = async () => {
      setLoading(true)
      const { results } = await globalSearch(query)
      setResults(results)
      setLoading(false)
    }
    
    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [query])
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'account':
        return BuildingIcon
      case 'contact':
        return UserIcon
      case 'project':
        return FolderIcon
      case 'task':
        return CheckSquareIcon
      default:
        return BuildingIcon
    }
  }
  
  const handleSelect = (url: string) => {
    router.push(url)
    setOpen(false)
    setQuery('')
  }
  
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search accounts, contacts, projects, tasks..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm">Searching...</div>
        )}
        
        {!loading && query.length >= 2 && results.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        
        {!loading && results.length > 0 && (
          <>
            {['account', 'contact', 'project', 'task'].map((type) => {
              const items = results.filter((r) => r.type === type)
              if (items.length === 0) return null
              
              return (
                <CommandGroup key={type} heading={`${type}s`.toUpperCase()}>
                  {items.map((item) => {
                    const Icon = getIcon(type)
                    return (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleSelect(item.url)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-text-tertiary">
                            {item.subtitle}
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            })}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
```

---

## 7. Feature Requirements by Version

### MVP (Version 1.0) - Months 1-2

**Core Features:**
- ✅ User authentication (email/password with Better-Auth)
- ✅ Organization management
- ✅ Role-based access control (SUPER_ADMIN, OWNER, ADMIN, USER)
- ✅ Accounts CRUD with member management
- ✅ Contacts CRUD
- ✅ Projects CRUD
- ✅ Tasks & Subtasks CRUD
- ✅ Activity/Audit log for all entities
- ✅ Global search (database full-text)
- ✅ Command palette (Cmd+K)
- ✅ Responsive UI (mobile-first)
- ✅ Light/Dark mode
- ✅ i18n setup (English only initially)
- ✅ Onboarding wizard
- ✅ Profile & settings pages
- ✅ Rate limiting on auth endpoints
- ✅ Maintenance mode (DB flag)
- ✅ Disaster mode (ENV variable)

**Technical:**
- Next.js 15 App Router
- Prisma + SQLite (dev) / PostgreSQL (prod)
- Better-Auth with JWT
- Tailwind + shadcn/ui
- Server Actions for all mutations
- Full TypeScript + Zod validation
- Docker + GitHub Actions CI/CD

### Version 2.0 - Months 3-4

**Sales & Pipeline:**
- ✅ Deals/Opportunities CRUD
- ✅ Sales pipeline stages
- ✅ Drag-and-drop kanban board
- ✅ Deal value tracking
- ✅ Win/loss analytics

**Enhanced Features:**
- ✅ Advanced filtering & sorting
- ✅ Bulk operations
- ✅ Data export (CSV)
- ✅ Reports & Analytics (basic)
  - Sales dashboard
  - Project dashboard
  - Activity timeline
- ✅ Webhooks (foundation)

**Integrations:**
- ✅ OAuth providers (Google, GitHub, Microsoft)

### Version 3.0 - Months 5-6

**Communication:**
- ✅ Email notifications (Resend)
  - Task assignments
  - Deal stage changes
  - Project updates
  - @mentions

**File Management:**
- ✅ File attachments (UploadThing or S3)
- ✅ Attach files to accounts, projects, tasks
- ✅ File previews
- ✅ File versioning

**Collaboration:**
- ✅ Comments on entities
- ✅ @mentions in comments
- ✅ Real-time notifications (Server-Sent Events)

### Version 4.0 - Future

**Performance:**
- ✅ Redis caching layer
- ✅ Advanced search (Meilisearch)
- ✅ Optimized queries
- ✅ CDN for static assets

**Advanced Features:**
- ✅ Custom fields per entity
- ✅ Custom workflows
- ✅ Automated actions/triggers
- ✅ Advanced reporting & analytics
- ✅ Dashboard customization

### Version 5.0 - Future

**AI Features:**
- ✅ AI chat assistant
- ✅ Smart suggestions
- ✅ Automated data entry
- ✅ Sentiment analysis on communications

**External API:**
- ✅ REST API for external access
- ✅ API documentation
- ✅ Rate limiting
- ✅ API keys management
- ✅ Webhook marketplace

---

## 8. Project Structure

```
crm-app/
├── src/
│   ├── app/
│   │   ├── (public)/              # Public routes
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── about/
│   │   │   ├── docs/
│   │   │   └── legal/
│   │   │       ├── privacy/
│   │   │       └── terms/
│   │   ├── (auth)/                # Auth routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/           # Main app (protected)
│   │   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   │   ├── dashboard/         # Main dashboard
│   │   │   ├── accounts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   └── new/
│   │   │   ├── contacts/
│   │   │   ├── deals/             # V2
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── tasks/             # Unified task view
│   │   │   ├── activities/        # Activity log view
│   │   │   ├── reports/           # V2
│   │   │   └── settings/
│   │   │       ├── profile/
│   │   │       ├── organization/
│   │   │       ├── preferences/
│   │   │       └── security/
│   │   ├── onboarding/            # First-time setup
│   │   ├── disaster/              # Disaster mode page
│   │   ├── maintenance/           # Maintenance page
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── layouts/               # Layout components
│   │   │   ├── page-header.tsx
│   │   │   ├── page-content.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── navbar.tsx
│   │   ├── features/              # Feature-specific components
│   │   │   ├── accounts/
│   │   │   │   ├── account-form.tsx
│   │   │   │   ├── account-card.tsx
│   │   │   │   └── account-list.tsx
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   └── activities/
│   │   ├── command-palette.tsx    # Global search
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── actions/               # Server Actions
│   │   │   ├── accounts.ts
│   │   │   ├── contacts.ts
│   │   │   ├── projects.ts
│   │   │   ├── tasks.ts
│   │   │   ├── activities.ts
│   │   │   └── search.ts
│   │   ├── auth/
│   │   │   ├── config.ts          # Better-Auth setup
│   │   │   ├── permissions.ts     # Permission system
│   │   │   └── action-auth.ts     # Server Action auth helpers
│   │   ├── db/
│   │   │   ├── index.ts           # Prisma client
│   │   │   └── seed.ts            # Database seeding
│   │   ├── validations/           # Zod schemas
│   │   │   ├── account.ts
│   │   │   ├── project.ts
│   │   │   └── task.ts
│   │   └── utils/                 # Helper functions
│   │       ├── cn.ts
│   │       ├── date.ts
│   │       └── format.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   ├── types/                     # TypeScript types
│   │   ├── auth.ts
│   │   └── index.ts
│   └── messages/                  # i18n translations
│       └── en.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   └── fonts/
├── .env.example
├── .env.local
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 9. Security Guidelines

### 9.1 Critical Security Measures

**Authentication:**
- ✅ Password hashing with bcrypt (min 12 rounds)
- ✅ JWT tokens with short expiration (7 days)
- ✅ Email verification required
- ✅ Rate limiting on auth endpoints (5 attempts/15 min)
- ✅ CSRF protection (Better-Auth handles this)

**Authorization:**
- ✅ Claims-based permission system
- ✅ Organization context validation on every request
- ✅ Row-level security with Prisma middleware
- ✅ Server Actions always validate user + org

**Data Protection:**
- ✅ Soft deletes (preserve audit trail)
- ✅ Activity logging for all mutations
- ✅ IP address + User Agent tracking
- ✅ No sensitive data in logs
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React + Next.js built-in)

**Headers & Policies:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
]
```

### 9.2 Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Auth endpoints: 5 attempts per 15 minutes
export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
})

// General API: 100 requests per minute
export const apiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
})

// Usage in Server Actions
export async function loginAction(email: string, password: string) {
  'use server'
  
  const identifier = email
  const { success } = await authRateLimit.limit(identifier)
  
  if (!success) {
    throw new Error('Too many attempts. Please try again later.')
  }
  
  // Proceed with login...
}
```

---

## 10. Internationalization (i18n)

### 10.1 Setup with next-intl

```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}))
```

```json
// messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "filter": "Filter"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot password?"
  },
  "accounts": {
    "title": "Accounts",
    "create": "Create Account",
    "empty": {
      "title": "No accounts yet",
      "description": "Get started by creating your first customer account"
    },
    "count": "{count, plural, =0 {No accounts} one {# account} other {# accounts}}"
  },
  "projects": {
    "title": "Projects",
    "create": "Create Project",
    "selectAccount": "Select an account first",
    "status": {
      "planning": "Planning",
      "active": "Active",
      "onHold": "On Hold",
      "completed": "Completed",
      "cancelled": "Cancelled"
    }
  },
  "tasks": {
    "title": "Tasks",
    "create": "Create Task",
    "assignTo": "Assign to",
    "dueDate": "Due date",
    "priority": {
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "urgent": "Urgent"
    },
    "status": {
      "todo": "To Do",
      "inProgress": "In Progress",
      "blocked": "Blocked",
      "review": "Review",
      "completed": "Completed"
    }
  },
  "errors": {
    "unauthorized": "You don't have permission to perform this action",
    "notFound": "Resource not found",
    "serverError": "Something went wrong. Please try again.",
    "networkError": "Network error. Please check your connection."
  }
}
```

### 10.2 Usage in Components

```typescript
import { useTranslations } from 'next-intl'

export function AccountsPage() {
  const t = useTranslations('accounts')
  
  return (
    <PageHeader
      title={t('title')}
      action={{
        label: t('create'),
        onClick: () => setShowDialog(true)
      }}
    />
  )
}
```

---

## 11. Onboarding Flow

### 11.1 Wizard Steps

```typescript
// app/onboarding/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  
  const steps = [
    { id: 1, name: 'Organization Setup', component: <OrganizationStep /> },
    { id: 2, name: 'Test Data', component: <TestDataStep /> },
    { id: 3, name: 'First Account', component: <FirstAccountStep /> },
    { id: 4, name: 'Invite Team', component: <InviteTeamStep /> },
  ]
  
  return (
    <div className="mx-auto max-w-2xl py-12">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div
              key={s.id}
              className={`flex items-center ${
                index !== steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  s.id <= step
                    ? 'border-primary-400 bg-primary-400 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {s.id}
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    s.id < step ? 'bg-primary-400' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Current step */}
      {steps[step - 1].component}
    </div>
  )
}

// Step 1: Organization Setup
function OrganizationStep() {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
  })
  
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-2xl font-semibold">Set up your organization</h2>
      <p className="mt-2 text-sm text-text-secondary">
        Tell us about your company to get started
      </p>
      
      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Organization Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Acme Inc"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Industry</label>
          <Select>
            <option>Software</option>
            <option>Consulting</option>
            <option>Manufacturing</option>
            <option>Other</option>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium">Company Size</label>
          <Select>
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>201+</option>
          </Select>
        </div>
        
        <Button className="w-full">Continue</Button>
      </form>
    </div>
  )
}

// Step 2: Test Data
function TestDataStep() {
  const [includeTestData, setIncludeTestData] = useState(false)
  
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-2xl font-semibold">Start with sample data?</h2>
      <p className="mt-2 text-sm text-text-secondary">
        We can populate your CRM with example accounts and projects to help you get started
      </p>
      
      <div className="mt-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeTestData}
            onChange={(e) => setIncludeTestData(e.target.checked)}
            className="mr-2"
          />
          <span>Yes, add sample data</span>
        </label>
      </div>
      
      {includeTestData && (
        <div className="mt-4 rounded-lg bg-muted p-4">
          <p className="text-sm">We'll create:</p>
          <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
            <li>3 sample customer accounts</li>
            <li>5 sample projects</li>
            <li>10 sample tasks</li>
          </ul>
        </div>
      )}
      
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1">Back</Button>
        <Button className="flex-1">Continue</Button>
      </div>
    </div>
  )
}
```

---

## 12. Docker & Deployment

### 12.1 Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 12.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://crm:crm_password@postgres:5432/crm
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
      - DISASTER_MODE=${DISASTER_MODE:-false}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - crm-network
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=crm
      - POSTGRES_PASSWORD=crm_password
      - POSTGRES_DB=crm
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U crm"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - crm-network
    restart: unless-stopped

  # Optional: pgAdmin for database management (dev only)
  pgadmin:
    image: dpage/pgadmin4:latest
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@crm.local
      - PGADMIN_DEFAULT_PASSWORD=admin
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - crm-network
    profiles:
      - dev

volumes:
  postgres_data:
  pgadmin_data:

networks:
  crm-network:
    driver: bridge
```

### 12.3 GitHub Actions CI/CD

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: "file:./test.db"

  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' || github.event_name == 'release'
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploy to production server"
          # Add your deployment steps here
          # e.g., SSH to server and pull new image
```

### 12.4 Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crm"

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (V2)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=

# Rate Limiting (V1)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Email (V3)
# RESEND_API_KEY=

# File Storage (V3)
# UPLOADTHING_SECRET=
# UPLOADTHING_APP_ID=

# Maintenance
DISASTER_MODE="false"

# Monitoring (V2)
# SENTRY_DSN=
# SENTRY_ORG=
# SENTRY_PROJECT=
```

---

## 13. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Week 1: Project Setup**
- ✅ Initialize Next.js project with TypeScript
- ✅ Set up Prisma with SQLite
- ✅ Configure Tailwind CSS + shadcn/ui
- ✅ Set up Better-Auth
- ✅ Create base database schema
- ✅ Set up i18n with next-intl
- ✅ Configure ESLint + Prettier
- ✅ Set up Git + GitHub repository

**Week 2: Core Infrastructure**
- ✅ Implement authentication flow (login, register, verify)
- ✅ Create middleware for auth + organization context
- ✅ Build permission system
- ✅ Create base layout components (sidebar, navbar)
- ✅ Set up rate limiting
- ✅ Create command palette (global search)

### Phase 2: Core Entities (Weeks 3-4)

**Week 3: Organizations & Accounts**
- ✅ Organization CRUD
- ✅ Organization settings
- ✅ Account CRUD with validation
- ✅ Account member management
- ✅ Contact CRUD
- ✅ Activity logging for all actions

**Week 4: Projects & Tasks**
- ✅ Project CRUD
- ✅ Task CRUD with assignment
- ✅ Subtask functionality
- ✅ Task status management
- ✅ Project-Account-Task relationship view
- ✅ Activity timeline for tasks

### Phase 3: Polish & Onboarding (Weeks 5-6)

**Week 5: UI/UX Enhancement**
- ✅ Responsive design for mobile
- ✅ Dark mode implementation
- ✅ Empty states for all entities
- ✅ Loading states
- ✅ Error handling & toast notifications
- ✅ Form validation feedback

**Week 6: Onboarding & Settings**
- ✅ Onboarding wizard
- ✅ Profile page
- ✅ Organization settings
- ✅ User preferences
- ✅ Security settings (password change)
- ✅ Maintenance mode UI

### Phase 4: Deployment (Week 7-8)

**Week 7: Docker & CI/CD**
- ✅ Create Dockerfile
- ✅ Set up docker-compose
- ✅ GitHub Actions workflow
- ✅ Migrate to PostgreSQL
- ✅ Database migrations strategy
- ✅ Environment configuration

**Week 8: Production Readiness**
- ✅ Security audit
- ✅ Performance optimization
- ✅ Error monitoring setup
- ✅ Backup strategy
- ✅ Documentation
- ✅ Testing (E2E + Integration)
- ✅ Production deployment

### Phase 5: V2 Features (Months 3-4)

**Sales Pipeline**
- Deal/Opportunity entity
- Kanban board with drag-drop
- Sales analytics

**Advanced Features**
- Advanced filtering
- Bulk operations
- CSV export
- Basic reporting

**Integrations**
- OAuth providers (Google, GitHub, Microsoft)
- Webhook foundation

### Phase 6: V3 Features (Months 5-6)

**Communication**
- Email notifications
- Comments system
- @mentions

**File Management**
- File uploads
- File attachments
- File previews

---

## 14. Testing Strategy

### 14.1 Test Types

```typescript
// Unit Tests (Vitest)
// tests/unit/permissions.test.ts
import { describe, it, expect } from 'vitest'
import { hasPermission, canAccessAccount } from '@/lib/auth/permissions'

describe('Permission System', () => {
  it('SUPER_ADMIN has all permissions', () => {
    expect(hasPermission('SUPER_ADMIN', 'account:delete:all')).toBe(true)
    expect(hasPermission('SUPER_ADMIN', 'system:manage_settings')).toBe(true)
  })
  
  it('USER has limited permissions', () => {
    expect(hasPermission('USER', 'account:read:own')).toBe(true)
    expect(hasPermission('USER', 'account:delete:all')).toBe(false)
  })
  
  it('canAccessAccount checks membership', () => {
    const user = {
      userId: '1',
      organizationId: 'org1',
      role: 'USER',
      accountIds: ['acc1', 'acc2'],
      permissions: [],
      email: 'test@test.com',
      name: 'Test',
    }
    
    expect(canAccessAccount(user, 'acc1')).toBe(true)
    expect(canAccessAccount(user, 'acc3')).toBe(false)
  })
})
```

```typescript
// Integration Tests (Playwright)
// tests/e2e/accounts.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Accounts', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/app/dashboard')
  })
  
  test('can create new account', async ({ page }) => {
    await page.goto('/app/accounts')
    await page.click('button:has-text("Create Account")')
    
    await page.fill('input[name="name"]', 'Test Account')
    await page.fill('input[name="email"]', 'test@account.com')
    await page.click('button:has-text("Save")')
    
    await expect(page.locator('text=Test Account')).toBeVisible()
  })
  
  test('shows empty state when no accounts', async ({ page }) => {
    await page.goto('/app/accounts')
    await expect(page.locator('text=No accounts yet')).toBeVisible()
  })
})
```

### 14.2 Test Coverage Goals

- **Unit tests:** 70%+ coverage for business logic
- **Integration tests:** Critical user flows
- **E2E tests:** Main user journeys

---

## 15. Performance Targets

### 15.1 Key Metrics

**Page Load Performance:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

**Bundle Size:**
- Initial JS bundle: < 200KB (gzipped)
- Total page weight: < 1MB

**Database:**
- Query response time: < 100ms (95th percentile)
- Connection pool size: 10-20

**API:**
- Server Action response: < 200ms (95th percentile)
- Rate limits: 100 req/min per user

### 15.2 Monitoring (V2)

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

export function initMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    })
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  console.error(error)
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
  }
}
```

---

## 16. Additional Recommendations

### 16.1 Code Quality

**TypeScript Strict Mode:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**ESLint Configuration:**
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 16.2 Database Best Practices

**Migration Strategy:**
```bash
# Development: Create and apply migration
npm run prisma:migrate:dev

# Production: Apply migrations
npm run prisma:migrate:deploy

# Generate Prisma Client
npm run prisma:generate
```

**Backup Strategy:**
```bash
# Daily automated backups
# Retention: 30 days
# Storage: S3 or similar
pg_dump -Fc crm > backup_$(date +%Y%m%d).dump
```

### 16.3 Documentation

**Required Documentation:**
- ✅ README.md with setup instructions
- ✅ CONTRIBUTING.md for developers
- ✅ API documentation (if exposing API)
- ✅ Architecture Decision Records (ADRs)
- ✅ Deployment runbook
- ✅ Security guidelines

---

## 17. Summary & Next Steps

### What We've Defined

✅ **Complete technical specification** covering all aspects  
✅ **Database schema** with relationships and indexes  
✅ **Authentication & authorization** with claims-based permissions  
✅ **API layer** with Server Actions  
✅ **UI/UX guidelines** with design system  
✅ **Feature roadmap** (MVP → V5)  
✅ **Security measures** and best practices  
✅ **Docker & deployment** strategy  
✅ **Testing & monitoring** approach  

### Ready to Start Implementation

**Immediate Next Steps:**

1. **Initialize Project**
   ```bash
   npx create-next-app@latest crm-app --typescript --tailwind --app
   cd crm-app
   npm install prisma @prisma/client better-auth zod
   npx prisma init
   ```

2. **Set Up Database**
   - Copy Prisma schema from this spec
   - Run `npx prisma migrate dev`
   - Create seed data

3. **Implement Auth**
   - Configure Better-Auth
   - Create login/register pages
   - Set up middleware

4. **Build Core Features**
   - Follow roadmap week by week
   - Start with Organizations & Accounts
   - Add Projects & Tasks

### Questions Resolved

✅ Multi-tenancy approach: Row-Level Security  
✅ Auth solution: Better-Auth with JWT  
✅ Permission system: Claims-based with granular roles  
✅ Entity hierarchy: Organization → Account → Project → Task  
✅ Activity logging: Comprehensive audit trail  
✅ Search: Database full-text (MVP), Meilisearch (V4)  
✅ Deployment: Docker + GitHub Actions → GHCR  

---

## Appendix A: Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run type-check             # TypeScript check

# Database
npm run prisma:studio          # Open Prisma Studio
npm run prisma:migrate:dev     # Create & apply migration
npm run prisma:migrate:deploy  # Apply migrations (prod)
npm run prisma:generate        # Generate Prisma Client
npm run prisma:seed            # Seed database

# Testing
npm run test                   # Run unit tests
npm run test:watch             # Watch mode
npm run test:e2e               # Run E2E tests
npm run test:coverage          # Generate coverage report

# Docker
docker-compose up -d           # Start services
docker-compose down            # Stop services
docker-compose logs -f app     # View logs
docker-compose exec app sh     # Shell into container
```

---

**End of Specification v1.0**
