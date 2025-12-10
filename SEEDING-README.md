# Database Seeding Guide

This document explains how to set up and run the database seeding functionality for the CRM system.

## Prerequisites

Before running the seeding script, make sure you have:

1. Node.js (v20+) and npm installed
2. The project dependencies installed: `npm install`
3. A database configured in your `.env` file

## Database Setup

The project uses Prisma ORM for database operations. By default, it's configured to use PostgreSQL but can work with SQLite for development.

Create a `.env` file in the root directory with your database connection:

```env
# For PostgreSQL (production)
DATABASE_URL="postgresql://username:password@localhost:5432/crm_db"

# For SQLite (development)
DATABASE_URL="file:./dev.db"
```

## Running the Seeding Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Push Schema to Database (or run migrations)
```bash
# For development with SQLite
npx prisma db push

# For PostgreSQL
npx prisma migrate dev --name init
```

### 4. Run the Seeding Script
```bash
npm run prisma:seed
# or
npx tsx prisma/seed.ts
```

## Seeding Script Contents

The `prisma/seed.ts` file creates sample data including:

- **Organization**: Acme Corporation
- **Users**: Admin and regular users
- **Accounts**: Tech Solutions Inc, Global Innovations, Enterprise Systems
- **Contacts**: Associated with the accounts
- **Deals**: Sample sales opportunities in different stages
- **Projects**: Sample projects linked to accounts
- **Tasks**: Sample tasks assigned to users
- **Subtasks**: Subtasks for various tasks
- **Activities**: Audit trail entries
- **Account Memberships**: Linking users to accounts
- **Organization Settings**: Default settings for the organization

## What the Seed Data Includes

### Organizations
- One main organization: "Acme Corporation"

### Users
- Admin user: admin@acme-corp.com with ADMIN role
- Regular user: user@acme-corp.com with USER role

### Accounts
- Tech Solutions Inc: Technology company
- Global Innovations: Consulting services
- Enterprise Systems: Software and services

### Contacts
- Multiple contacts per account with names, positions, emails, and phones

### Deals
- Deals in various stages (QUALIFIED, PROPOSAL, NEGOTIATION)
- Values ranging from $85,000 to $210,000
- Assigned to different users

### Projects
- Projects in different statuses (ACTIVE, PLANNING, ON_HOLD)
- Associated with different accounts

### Tasks
- Tasks with various priorities (HIGH, MEDIUM) and statuses
- Assigned to different users
- Associated with different projects

### Subtasks
- Multiple subtasks for complex tasks
- Some marked as completed

## Troubleshooting

If you encounter issues with the seeding process:

1. **Module not found errors**: Make sure you've run `npm install` and `npx prisma generate`
2. **Database connection errors**: Verify your DATABASE_URL in the .env file
3. **Migration issues**: Try `npx prisma migrate reset` (this will clear all data) and re-run migrations

## Development Workflow

For development, the recommended workflow is:

1. Set up your .env file with a SQLite database URL
2. Run `npm install`
3. Run `npx prisma generate`
4. Run `npx prisma db push`
5. Run `npm run prisma:seed`

This will create a fully populated development database with sample data for testing the CRM functionality.