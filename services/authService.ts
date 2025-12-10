import { prisma } from '@/lib/db';
import { User, Organization } from '@prisma/client';
import { getAuth } from '@/lib/auth';

/**
 * Authentication service to handle user and organization context
 */
export class AuthService {
  /**
   * Get the current user and organization context from the session
   * @returns ServiceContext containing user and organization info, or null if not authenticated
   */
  static async getContext() {
    const session = await getAuth();
    
    if (!session?.user) {
      return null;
    }

    // Get the user from the database to ensure we have the latest data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      // User exists in auth but not in our database - this shouldn't happen normally
      // but might happen during initial setup
      return null;
    }

    // Get the organization for this user
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    if (!organization) {
      // Organization doesn't exist - this shouldn't happen either
      return null;
    }

    return {
      userId: user.id,
      organizationId: user.organizationId,
      user,
      organization,
    };
  }

  /**
   * Create a new user and organization during initial registration
   */
  static async createUserWithOrganization(email: string, name: string, organizationName: string) {
    // Create an organization first
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: this.generateSlug(organizationName),
        // Add any other organization details
      },
    });

    // Create the user with the organization
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'OWNER', // First user is always owner
        organizationId: organization.id,
        emailVerified: new Date(),
      },
    });

    // Create organization settings
    await prisma.organizationSettings.create({
      data: {
        organizationId: organization.id,
        timezone: 'UTC',
        locale: 'en',
        currency: 'USD',
        enableProjects: true,
        enableDeals: true,
      },
    });

    return { user, organization };
  }

  /**
   * Link an existing user to an organization (for team members)
   */
  static async addUserToOrganization(userId: string, organizationId: string, role: 'ADMIN' | 'USER' = 'USER') {
    // Verify the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization does not exist');
    }

    // Update the user's organization
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId,
        role,
      },
    });

    return user;
  }

  /**
   * Generate a slug from a name
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Validate if a user has access to a specific organization
   */
  static async validateUserOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user?.organizationId === organizationId;
  }

  /**
   * Get organization users with role-based access control
   */
  static async getOrganizationUsers(organizationId: string, requestingUserId: string, minRole?: 'OWNER' | 'ADMIN' | 'USER') {
    // First verify the requesting user has access to this organization
    const hasAccess = await this.validateUserOrganizationAccess(requestingUserId, organizationId);
    if (!hasAccess) {
      throw new Error('User does not have access to this organization');
    }

    // Get requesting user's role
    const requestingUser = await prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!requestingUser) {
      throw new Error('Requesting user not found');
    }

    // Apply role-based access control
    let roleFilter: any = {};
    if (minRole) {
      const roleHierarchy = {
        USER: 0,
        ADMIN: 1,
        OWNER: 2,
      };
      
      // Only allow access to users with equal or lower role than the requesting user
      if (requestingUser.role === 'USER') {
        // Users can only see themselves
        roleFilter = { id: requestingUserId };
      } else if (requestingUser.role === 'ADMIN') {
        // Admins can see users and themselves, but not owners
        roleFilter = {
          OR: [
            { id: requestingUserId },
            { role: 'USER' },
          ],
        };
      } else if (requestingUser.role === 'OWNER') {
        // Owners can see all users in their organization
        roleFilter = {};
      }
    }

    return prisma.user.findMany({
      where: {
        organizationId,
        ...roleFilter,
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