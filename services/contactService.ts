import { prisma } from '@/lib/db';
import { Contact } from '@prisma/client';
import { BaseService, ServiceContext } from './baseService';

interface ContactCreateInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  accountId: string;
}

interface ContactUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
}

export class ContactService extends BaseService<Contact> {
  constructor(context: ServiceContext) {
    super(context);
  }

  async create(data: ContactCreateInput): Promise<Contact> {
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

    return prisma.contact.create({
      data: {
        ...data,
        organizationId: this.context.organizationId,
        createdBy: this.context.userId,
      },
    });
  }

  async find(query: Partial<Contact>): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: {
        organizationId: this.context.organizationId,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Contact | null> {
    const isValid = await this.validateOwnership('contact', id, this.context.organizationId);
    if (!isValid) return null;

    return prisma.contact.findFirst({
      where: {
        id,
        organizationId: this.context.organizationId,
      },
      include: {
        account: true,
      },
    });
  }

  async update(id: string, data: ContactUpdateInput): Promise<Contact> {
    const isValid = await this.validateOwnership('contact', id, this.context.organizationId);
    if (!isValid) throw new Error('Contact does not belong to your organization');

    return prisma.contact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Contact> {
    const isValid = await this.validateOwnership('contact', id, this.context.organizationId);
    if (!isValid) throw new Error('Contact does not belong to your organization');

    // Perform soft delete
    return prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Search contacts by name or email
   */
  async search(query: string): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: {
        organizationId: this.context.organizationId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  /**
   * Get contacts by account
   */
  async getContactsByAccount(accountId: string) {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        organizationId: this.context.organizationId,
      },
    });
    
    if (!account) {
      throw new Error('Account does not belong to your organization');
    }

    return prisma.contact.findMany({
      where: { accountId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}