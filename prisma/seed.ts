import { Prisma, PrismaClient } from '@prisma/client';

// Define string literal types for our enum-like values since SQLite doesn't support real enums
type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'USER';
type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'REVIEW' | 'COMPLETED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create an organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'acme-corporation' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corporation',
      industry: 'Technology',
      size: '50-200',
      website: 'https://acme-corp.com',
      logoUrl: 'https://placehold.co/200x200/3b82f6/white?text=AC',
    },
  });

  console.log('Created/updated organization:', organization.name);

  // Create users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme-corp.com' },
    update: {},
    create: {
      email: 'admin@acme-corp.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      organizationId: organization.id,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@acme-corp.com' },
    update: {},
    create: {
      email: 'user@acme-corp.com',
      name: 'Regular User',
      role: UserRole.USER,
      organizationId: organization.id,
    },
  });

  console.log('Created users:', [adminUser.name, regularUser.name]);

  // Create accounts
  const accountsData = [
    {
      name: 'Tech Solutions Inc',
      description: 'Leading technology solutions provider',
      website: 'https://techsolutions.com',
      email: 'contact@techsolutions.com',
      phone: '+1-555-0101',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
    },
    {
      name: 'Global Innovations',
      description: 'Innovation and consulting services',
      website: 'https://globalinnovations.com',
      email: 'info@globalinnovations.com',
      phone: '+1-555-0102',
      address: '456 Innovation Blvd',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    {
      name: 'Enterprise Systems',
      description: 'Enterprise software and services',
      website: 'https://enterprisesystems.com',
      email: 'hello@enterprisesystems.com',
      phone: '+1-555-0103',
      address: '789 Enterprise Ave',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
    },
  ];

  const createdAccounts = [];
  for (const accountData of accountsData) {
    const account = await prisma.account.create({
      data: {
        ...accountData,
        organizationId: organization.id,
        createdBy: adminUser.id,
      },
    });
    createdAccounts.push(account);
    console.log('Created account:', account.name);
  }

  // Create contacts
  const contactsData = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@techsolutions.com',
      phone: '+1-555-0201',
      position: 'CTO',
      accountId: createdAccounts[0].id,
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@techsolutions.com',
      phone: '+1-555-0202',
      position: 'Project Manager',
      accountId: createdAccounts[0].id,
    },
    {
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@globalinnovations.com',
      phone: '+1-555-0203',
      position: 'CEO',
      accountId: createdAccounts[1].id,
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@globalinnovations.com',
      phone: '+1-555-0204',
      position: 'Sales Director',
      accountId: createdAccounts[1].id,
    },
    {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@enterprisesystems.com',
      phone: '+1-555-0205',
      position: 'Technical Lead',
      accountId: createdAccounts[2].id,
    },
  ];

  const createdContacts = [];
  for (const contactData of contactsData) {
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        organizationId: organization.id,
        createdBy: adminUser.id,
      },
    });
    createdContacts.push(contact);
    console.log('Created contact:', `${contact.firstName} ${contact.lastName}`);
  }

  // Create deals
  const dealsData = [
    {
      title: 'Enterprise Software Implementation',
      description: 'Full enterprise software solution for Tech Solutions Inc',
      value: new Prisma.Decimal(125000),
      stage: DealStage.QUALIFIED,
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      accountId: createdAccounts[0].id,
      assignedToId: adminUser.id,
    },
    {
      title: 'Consulting Services Contract',
      description: '6-month consulting engagement with Global Innovations',
      value: new Prisma.Decimal(85000),
      stage: DealStage.PROPOSAL,
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      accountId: createdAccounts[1].id,
      assignedToId: regularUser.id,
    },
    {
      title: 'System Integration Project',
      description: 'Integration of multiple systems for Enterprise Systems',
      value: new Prisma.Decimal(210000),
      stage: DealStage.NEGOTIATION,
      probability: 90,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      accountId: createdAccounts[2].id,
      assignedToId: adminUser.id,
    },
  ];

  const createdDeals = [];
  for (const dealData of dealsData) {
    const deal = await prisma.deal.create({
      data: {
        ...dealData,
        organizationId: organization.id,
        createdBy: adminUser.id,
      },
    });
    createdDeals.push(deal);
    console.log('Created deal:', deal.title);
  }

  // Create projects
  const projectsData = [
    {
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      status: ProjectStatus.ACTIVE,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      accountId: createdAccounts[0].id,
    },
    {
      name: 'Mobile App Development',
      description: 'Development of new mobile application',
      status: ProjectStatus.PLANNING,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      accountId: createdAccounts[1].id,
    },
    {
      name: 'Data Migration',
      description: 'Migrate legacy systems to new platform',
      status: ProjectStatus.ON_HOLD,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      accountId: createdAccounts[2].id,
    },
  ];

  const createdProjects = [];
  for (const projectData of projectsData) {
    const project = await prisma.project.create({
      data: {
        ...projectData,
        organizationId: organization.id,
        createdBy: adminUser.id,
      },
    });
    createdProjects.push(project);
    console.log('Created project:', project.name);
  }

  // Create tasks
  const tasksData = [
    {
      title: 'Design Homepage',
      description: 'Create new design for homepage',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      projectId: createdProjects[0].id,
      assignedToId: regularUser.id,
    },
    {
      title: 'Implement API',
      description: 'Build API endpoints for mobile app',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      projectId: createdProjects[1].id,
      assignedToId: adminUser.id,
    },
    {
      title: 'Database Migration',
      description: 'Migrate customer data to new system',
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.URGENT,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      projectId: createdProjects[2].id,
      assignedToId: regularUser.id,
    },
    {
      title: 'User Testing',
      description: 'Conduct user testing sessions',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      projectId: createdProjects[0].id,
      assignedToId: adminUser.id,
    },
  ];

  const createdTasks = [];
  for (const taskData of tasksData) {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        organizationId: organization.id,
        createdBy: adminUser.id,
      },
    });
    createdTasks.push(task);
    console.log('Created task:', task.title);
  }

  // Create subtasks
  const subtasksData = [
    {
      title: 'Create wireframes',
      completed: false,
      taskId: createdTasks[0].id,
    },
    {
      title: 'Design color scheme',
      completed: true,
      taskId: createdTasks[0].id,
    },
    {
      title: 'Set up authentication',
      completed: false,
      taskId: createdTasks[1].id,
    },
    {
      title: 'Create user endpoints',
      completed: false,
      taskId: createdTasks[1].id,
    },
    {
      title: 'Test migration script',
      completed: false,
      taskId: createdTasks[2].id,
    },
  ];

  const createdSubtasks = [];
  for (const subtaskData of subtasksData) {
    const subtask = await prisma.subtask.create({
      data: {
        ...subtaskData,
        createdBy: adminUser.id,
      },
    });
    createdSubtasks.push(subtask);
    console.log('Created subtask:', subtask.title);
  }

  // Create account memberships
  await prisma.accountMember.create({
    data: {
      accountId: createdAccounts[0].id,
      userId: adminUser.id,
    },
  });
  
  await prisma.accountMember.create({
    data: {
      accountId: createdAccounts[1].id,
      userId: regularUser.id,
    },
  });

  console.log('Created account memberships');

  // Create activities
  const activitiesData = [
    {
      entityType: 'ACCOUNT',
      entityId: createdAccounts[0].id,
      activityType: 'CREATED',
      description: 'Account created in CRM system',
      performedById: adminUser.id,
      accountId: createdAccounts[0].id,
    },
    {
      entityType: 'CONTACT',
      entityId: createdContacts[0].id,
      activityType: 'CREATED',
      description: 'Contact created for John Smith',
      performedById: adminUser.id,
      accountId: createdAccounts[0].id,
      contactId: createdContacts[0].id,
    },
    {
      entityType: 'DEAL',
      entityId: createdDeals[0].id,
      activityType: 'DEAL_STAGE_CHANGED',
      description: 'Deal moved from LEAD to QUALIFIED stage',
      performedById: adminUser.id,
      accountId: createdAccounts[0].id,
      dealId: createdDeals[0].id,
    },
    {
      entityType: 'TASK',
      entityId: createdTasks[0].id,
      activityType: 'TASK_ASSIGNED',
      description: 'Task assigned to Regular User',
      performedById: adminUser.id,
      accountId: createdAccounts[0].id,
      taskId: createdTasks[0].id,
    },
  ];

  for (const activityData of activitiesData) {
    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        organizationId: organization.id,
      },
    });
    console.log('Created activity:', activity.description);
  }

  // Create organization settings
  await prisma.organizationSettings.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: {
      organizationId: organization.id,
      timezone: 'UTC',
      locale: 'en',
      currency: 'USD',
      enableProjects: true,
      enableDeals: true,
    },
  });

  console.log('Created organization settings');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });