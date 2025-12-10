# Modern CRM System

A modern, minimal CRM system built for small-to-medium teams with focus on simplicity, security, and extensibility. The system manages customer relationships through Organizations, Accounts, Sales Opportunities, Projects, and Tasks with comprehensive activity tracking.

## Features

- **Multi-tenancy**: Row-level security with Prisma middleware
- **User Management**: Role-based access control (SUPER_ADMIN, OWNER, ADMIN, USER)
- **Account Management**: Track customer companies and organizations
- **Contact Management**: Manage individuals at customer companies
- **Deal Pipeline**: Track sales opportunities through stages
- **Project Management**: Organize work by customer projects
- **Task Management**: Assign and track individual tasks
- **Activity Logging**: Complete audit trail of all actions
- **Full-text Search**: Fast search across all entities
- **Authentication & Authorization**: Secure login system with role-based access control (RBAC) and multi-tenancy support

## Technology Stack

- **Next.js 15+** (App Router, React Server Components)
- **TypeScript 5+** (Strict mode)
- **Prisma ORM** with PostgreSQL/SQLite
- **Better-Auth** for authentication
- **Tailwind CSS** and **shadcn/ui** for styling
- **Zod** for schema validation

## Authentication System

The application implements a comprehensive authentication and authorization system:

- User registration and login with email/password
- Role-based access control (SUPER_ADMIN, OWNER, ADMIN, USER)
- Multi-tenancy with organization-based data isolation
- Protected routes and API endpoints
- Server and client-side authorization utilities

For detailed information about the authentication system, see [AUTH-README.md](./AUTH-README.md).

## Database Seeding

This project includes comprehensive database seeding functionality to set up initial test data. The seed script creates:

- Sample organization with settings
- Admin and regular users
- Sample accounts with contact information
- Sales opportunities (deals) in various stages
- Projects and associated tasks
- Subtasks and activity logs

To run the seeding process:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run the seed script
npm run prisma:seed
```

For more detailed instructions, see the [SEEDING-README.md](./SEEDING-README.md) file.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your database and environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Seed the database: `npm run prisma:seed`
6. Start the development server: `npm run dev`

## Project Structure

- `prisma/` - Database schema and seed files
- `src/app/` - Next.js app router pages
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and libraries
- `lib/` - Authentication and other library files
- `components/` - Additional component files
- `app/` - API routes and authentication
