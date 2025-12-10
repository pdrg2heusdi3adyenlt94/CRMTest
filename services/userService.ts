import { prisma } from '@/lib/db';
import { User, UserRole } from '@prisma/client';
import { BaseService, ServiceContext } from './baseService';

interface UserCreateInput {
  email: string;
  name?: string;
  role: UserRole;
  organizationId: string;
}

interface UserUpdateInput {
  name?: string;
  role?: UserRole;
}

export class UserService extends BaseService<User> {
  constructor(context: ServiceContext) {
    super(context);
  }

  async create(data: UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        emailVerified: new Date(),
      },
    });
  }

  async find(query: Partial<User>): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        organizationId: this.context.organizationId,
        ...query,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<User | null> {
    const isValid = await this.validateOwnership('user', id, this.context.organizationId);
    if (!isValid) return null;

    return prisma.user.findFirst({
      where: {
        id,
        organizationId: this.context.organizationId,
      },
    });
  }

  async update(id: string, data: UserUpdateInput): Promise<User> {
    const isValid = await this.validateOwnership('user', id, this.context.organizationId);
    if (!isValid) throw new Error('User does not belong to your organization');

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    const isValid = await this.validateOwnership('user', id, this.context.organizationId);
    if (!isValid) throw new Error('User does not belong to your organization');

    // Perform soft delete
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get users in an organization
   */
  async getUsersForOrganization(organizationId: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }
}