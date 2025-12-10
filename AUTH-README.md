# Authentication and Authorization System

This document describes the authentication and authorization system implemented in the CRM application.

## Overview

The CRM application uses `better-auth` for authentication with role-based access control (RBAC) and multi-tenancy support. The system provides:

- User registration and login
- Role-based access control
- Multi-tenancy (users belong to organizations)
- API route protection
- Server and client-side authorization utilities

## Architecture

### Authentication Flow

1. User registers/logs in via the authentication API routes
2. Middleware intercepts requests to protected routes
3. Session information is extracted and validated
4. User role and organization information is added to request headers
5. Protected resources verify permissions before granting access

### Role Hierarchy

The system implements the following role hierarchy (in descending order of privilege):

1. `SUPER_ADMIN` - Has access to all resources across all organizations
2. `OWNER` - Has full access within their organization
3. `ADMIN` - Has administrative access within their organization
4. `USER` - Has basic access within their organization

## Key Components

### 1. Middleware (`/middleware.ts`)

The middleware handles:

- Authentication for protected routes
- Role-based access control for admin routes
- Adding user information to request headers
- Redirecting unauthenticated users to login

### 2. Authentication Configuration (`/src/lib/auth/config.ts`)

Configures the `better-auth` library with:

- Database adapter (Prisma)
- Email/password authentication
- Custom fields for role and organization
- Session management

### 3. Server-Side Utilities (`/src/lib/auth/server.ts`)

Provides server-side functions for:

- Getting current user from headers
- Checking user roles
- Verifying organization access
- RBAC guards
- Redirect utilities

### 4. Client-Side Utilities (`/src/lib/auth/authorization.ts`)

Provides client-side functions for:

- Checking user roles
- Verifying organization access
- RBAC guards

### 5. Session Utilities (`/src/lib/auth/session.ts`)

Provides functions for:

- Getting current session
- Checking authentication status
- Getting user information

### 6. Protected Route Component (`/src/components/auth/protected-route.tsx`)

A React component that wraps protected content and:

- Checks user authentication
- Verifies role permissions
- Redirects unauthorized users

### 7. Permissions API (`/app/api/auth/permissions/route.ts`)

An API route that allows checking permissions:

- `/api/auth/permissions?role=ADMIN&organizationId=...` - Check if user has specific role and organization access

## Usage

### Protecting Server Components

```typescript
import { requireRole, isAdmin } from '@/src/lib/auth/server';

// In your server component
export default async function ProtectedPage() {
  // Require user to be authenticated
  requireAuth();
  
  // Require user to be admin
  requireRole('ADMIN');
  
  // Or check conditionally
  if (!isAdmin()) {
    redirect('/unauthorized');
  }
  
  // Your component logic here
}
```

### Protecting Client Components

```typescript
'use client';

import ProtectedRoute from '@/src/components/auth/protected-route';

export default function Dashboard() {
  return (
    <ProtectedRoute requiredRole="USER">
      <div>Your protected content here</div>
    </ProtectedRoute>
  );
}
```

### Checking Permissions in API Routes

```typescript
import { getCurrentUserFromHeaders } from '@/src/lib/auth/server';

export async function GET(request: Request) {
  const user = getCurrentUserFromHeaders();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Check if user belongs to the organization that owns the resource
  if (user.organizationId !== resourceOrganizationId) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Continue with the request
}
```

## Environment Variables

Make sure to set these environment variables:

```bash
# Authentication secret (use a strong random value in production)
AUTH_SECRET=your-super-secret-auth-key

# Database URL
DATABASE_URL=your-database-url

# For production, enable email verification
NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
```

## Multi-Tenancy

The system ensures data isolation between organizations:

- Users belong to a single organization
- Users can only access resources in their organization
- Super admins can access all organizations
- Organization ID is validated for all resource access

## Security Considerations

- Always validate organization ID when accessing resources
- Use server-side checks for critical operations
- Never rely solely on client-side authorization
- Use HTTPS in production
- Rotate AUTH_SECRET regularly
- Implement rate limiting for authentication endpoints