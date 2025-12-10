import { prisma } from '@/lib/db';
import { Deal, DealStage } from '@prisma/client';
import { BaseService, ServiceContext } from './baseService';

interface DealCreateInput {
  title: string;
  description?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  accountId: string;
  assignedToId?: string;
}

interface DealUpdateInput {
  title?: string;
  description?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  assignedToId?: string;
}

export class DealService extends BaseService<Deal> {
  constructor(context: ServiceContext) {
    super(context);
  }

  async create(data: DealCreateInput): Promise<Deal> {
    // Verify that the account belongs to the same organization
    const account = await prisma.account.findFirst({
      where: {
        id: data.accountId,
        organizationId: this.context.organizationId,
      },
    });
    
    if (!account) {
      throw new Error('Account does not belong to your organization');
    }

    return prisma.deal.create({
      data: {
        ...data,
        organizationId: this.context.organizationId,
        createdBy: this.context.userId,
      },
    });
  }

  async find(query: Partial<Deal>): Promise<Deal[]> {
    return prisma.deal.findMany({
      where: {
        organizationId: this.context.organizationId,
        ...query,
      },
      include: {
        account: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Deal | null> {
    const isValid = await this.validateOwnership('deal', id, this.context.organizationId);
    if (!isValid) return null;

    return prisma.deal.findFirst({
      where: {
        id,
        organizationId: this.context.organizationId,
      },
      include: {
        account: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: DealUpdateInput): Promise<Deal> {
    const isValid = await this.validateOwnership('deal', id, this.context.organizationId);
    if (!isValid) throw new Error('Deal does not belong to your organization');

    return prisma.deal.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Deal> {
    const isValid = await this.validateOwnership('deal', id, this.context.organizationId);
    if (!isValid) throw new Error('Deal does not belong to your organization');

    // Perform soft delete
    return prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Search deals by title or description
   */
  async search(query: string): Promise<Deal[]> {
    return prisma.deal.findMany({
      where: {
        organizationId: this.context.organizationId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get deals by account
   */
  async getDealsByAccount(accountId: string) {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        organizationId: this.context.organizationId,
      },
    });
    
    if (!account) {
      throw new Error('Account does not belong to your organization');
    }

    return prisma.deal.findMany({
      where: { accountId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get deals by stage
   */
  async getDealsByStage(stage: DealStage) {
    return prisma.deal.findMany({
      where: {
        organizationId: this.context.organizationId,
        stage,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get deals by assigned user
   */
  async getDealsByAssignedTo(userId: string) {
    return prisma.deal.findMany({
      where: {
        organizationId: this.context.organizationId,
        assignedToId: userId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get deals summary by stage
   */
  async getDealsSummary() {
    const stages = Object.values(DealStage);
    const summary = await Promise.all(
      stages.map(async (stage) => {
        const deals = await prisma.deal.groupBy({
          by: ['stage'],
          where: {
            organizationId: this.context.organizationId,
            stage,
          },
          _count: true,
          _sum: {
            value: true,
          },
        });
        
        return deals[0] || { stage, _count: 0, _sum: { value: 0 } };
      })
    );

    return summary;
  }
}