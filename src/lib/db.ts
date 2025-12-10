import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  prisma = global.cachedPrisma
}

// Add middleware for multi-tenancy
prisma.$use(async (params, next) => {
  // List of models that are scoped to organizations
  const TENANT_SCOPED_MODELS = [
    'Account',
    'Contact',
    'Deal',
    'Project',
    'Task',
    'Activity',
    'Webhook'
  ]

  // Add organization filter for tenant-scoped models
  if (TENANT_SCOPED_MODELS.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique') {
      // Get organization ID from context or session (this would come from auth)
      // For now, we'll skip adding filters until we have the auth context
      
      // If we have an organization context, we'd add the filter:
      // params.args.where = {
      //   ...params.args.where,
      //   organizationId: orgId,
      // }
    }
  }

  return next(params)
})

export { prisma }