import { UserRole } from '@/types/user';
import { getAuth } from './session';

/**
 * Check if the current user has a specific role
 * @param requiredRole The role required to access the resource
 * @returns Boolean indicating if the user has the required role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const session = await getAuth();
  
  if (!session) {
    return false;
  }

  const userRole = session.user.role as UserRole;
  
  // Map roles by hierarchy - SUPER_ADMIN has access to everything
  const roleHierarchy: Record<UserRole, number> = {
    SUPER_ADMIN: 4,
    OWNER: 3,
    ADMIN: 2,
    USER: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if the current user is a super admin
 * @returns Boolean indicating if the user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('SUPER_ADMIN');
}

/**
 * Check if the current user is an admin or above
 * @returns Boolean indicating if the user is an admin or above
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAuth();
  if (!session) {
    return false;
  }

  const userRole = session.user.role as UserRole;
  return userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'OWNER';
}

/**
 * Check if the current user is the owner of the organization
 * @returns Boolean indicating if the user is the owner
 */
export async function isOwner(): Promise<boolean> {
  const session = await getAuth();
  if (!session) {
    return false;
  }

  const userRole = session.user.role as UserRole;
  return userRole === 'OWNER' || userRole === 'SUPER_ADMIN';
}

/**
 * Check if the current user is a regular user
 * @returns Boolean indicating if the user is a regular user
 */
export async function isUser(): Promise<boolean> {
  const session = await getAuth();
  if (!session) {
    return false;
  }

  const userRole = session.user.role as UserRole;
  return userRole === 'USER' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'OWNER';
}

/**
 * Check if the current user belongs to the specified organization
 * @param organizationId The organization ID to check against
 * @returns Boolean indicating if the user belongs to the organization
 */
export async function isInOrganization(organizationId: string): Promise<boolean> {
  const session = await getAuth();
  
  if (!session) {
    return false;
  }

  return session.user.organizationId === organizationId;
}

/**
 * Check if the current user has access to a specific resource based on organization
 * This is useful for multi-tenancy to ensure users can only access their organization's data
 * @param resourceOrgId The organization ID of the resource
 * @returns Boolean indicating if the user has access to the resource
 */
export async function canAccessResource(resourceOrgId: string): Promise<boolean> {
  const session = await getAuth();
  
  if (!session) {
    return false;
  }

  // Super admins can access any resource
  if (session.user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Regular users can only access resources in their organization
  return session.user.organizationId === resourceOrgId;
}

/**
 * Role-based access control guard
 * @param requiredRole The minimum role required
 * @param organizationId Optional organization ID to check
 * @returns Boolean indicating if access is granted
 */
export async function rbacGuard(requiredRole: UserRole, organizationId?: string): Promise<boolean> {
  const hasRequiredRole = await hasRole(requiredRole);
  
  if (!hasRequiredRole) {
    return false;
  }

  // If organization ID is provided, check if user belongs to that organization
  if (organizationId) {
    return canAccessResource(organizationId);
  }

  return true;
}