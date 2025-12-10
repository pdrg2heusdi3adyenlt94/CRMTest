import { prisma } from '@/lib/db';
import { Organization, User } from '@prisma/client';

export interface ServiceContext {
  userId: string;
  organizationId: string;
  user: User;
  organization: Organization;
}

export abstract class BaseService<T> {
  protected context: ServiceContext;

  constructor(context: ServiceContext) {
    this.context = context;
  }

  /**
   * Creates a new record with organization context
   */
  abstract create(data: any): Promise<T>;

  /**
   * Finds records with organization filtering
   */
  abstract find(query: any): Promise<T[]>;

  /**
   * Finds a single record by ID with organization context
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * Updates a record with organization validation
   */
  abstract update(id: string, data: any): Promise<T>;

  /**
   * Deletes a record (soft delete if applicable)
   */
  abstract delete(id: string): Promise<T>;

  /**
   * Validates that a record belongs to the current organization
   */
  protected async validateOwnership(modelName: keyof typeof prisma, id: string, organizationId: string): Promise<boolean> {
    try {
      const record = await prisma[modelName].findFirst({
        where: {
          id,
          organizationId,
        },
      });
      return record !== null;
    } catch (error) {
      console.error(`Error validating ownership for ${modelName}:`, error);
      return false;
    }
  }
}