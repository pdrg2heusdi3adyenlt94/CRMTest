import { prisma } from '@/lib/db';
import { Account } from '@prisma/client';
import { BaseService, ServiceContext } from './baseService';

interface AccountCreateInput {
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface AccountUpdateInput {
  name?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export class AccountService extends BaseService<Account> {
  constructor(context: ServiceContext) {
    super(context);
  }

  async create(data: AccountCreateInput): Promise<Account> {
    return prisma.account.create({
      data: {
        ...data,
        organizationId: this.context.organizationId,
        createdBy: this.context.userId,
      },
    });
  }

  async find(query: Partial<Account>): Promise<Account[]> {
    return prisma.account.findMany({
      where: {
        organizationId: this.context.organizationId,
        ...query,
      },
      include: {
        contacts: true,
        deals: true,
        projects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Account | null> {
    const isValid = await this.validateOwnership('account', id, this.context.organizationId);
    if (!isValid) return null;

    return prisma.account.findFirst({
      where: {
        id,
        organizationId: this.context.organizationId,
      },
      include: {
        contacts: true,
        deals: true,
        projects: true,
      },
    });
  }

  async update(id: string, data: AccountUpdateInput): Promise<Account> {
    const isValid = await this.validateOwnership('account', id, this.context.organizationId);
    if (!isValid) throw new Error('Account does not belong to your organization');

    return prisma.account.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Account> {
    const isValid = await this.validateOwnership('account', id, this.context.organizationId);
    if (!isValid) throw new Error('Account does not belong to your organization');

    // Perform soft delete
    return prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Search accounts by name or description
   */
  async search(query: string): Promise<Account[]> {
    return prisma.account.findMany({
      where: {
        organizationId: this.context.organizationId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        contacts: true,
        deals: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get account members
   */
  async getAccountMembers(accountId: string) {
    const isValid = await this.validateOwnership('account', accountId, this.context.organizationId);
    if (!isValid) throw new Error('Account does not belong to your organization');

    return prisma.accountMember.findMany({
      where: { accountId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Add member to account
   */
  async addAccountMember(accountId: string, userId: string) {
    const isValid = await this.validateOwnership('account', accountId, this.context.organizationId);
    if (!isValid) throw new Error('Account does not belong to your organization');

    return prisma.accountMember.create({
      data: {
        accountId,
        userId,
        addedBy: this.context.userId,
      },
    });
  }
}