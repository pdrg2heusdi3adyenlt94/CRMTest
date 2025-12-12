import { UserRole } from '@/types/user';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Get user information from request headers (set by middleware)
 * @returns User object with id, role, and organizationId
 */
export function getCurrentUserFromHeaders() {
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');
  const organizationId = headersList.get('x-organization-id');

  if (!userId || !userRole || !organizationId) {
    return null;
  }

  return {
    id: userId,
    role: userRole as UserRole,
    organizationId,
  };
}

/**
 * Check if the current user has a specific role
 * @param requiredRole The role required to access the resource
 * @returns Boolean indicating if the user has the required role
 */
export function hasRole(requiredRole: UserRole): boolean {
  const user = getCurrentUserFromHeaders();
  
  if (!user) {
    return false;
  }

  // Define role hierarchy - SUPER_ADMIN has access to everything
  const roleHierarchy: Record<UserRole, number> = {
    SUPER_ADMIN: 4,
    OWNER: 3,
    ADMIN: 2,
    USER: 1,
  };

  return roleHierarchy[user.role as UserRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if the current user is a super admin
 * @returns Boolean indicating if the user is a super admin
 */
export function isSuperAdmin(): boolean {
  return hasRole('SUPER_ADMIN');
}

/**
 * Check if the current user is an admin or above
 * @returns Boolean indicating if the user is an admin or above
 */
export function isAdmin(): boolean {
  const user = getCurrentUserFromHeaders();
  if (!user) {
    return false;
  }

  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'OWNER';
}

/**
 * Check if the current user is the owner of the organization
 * @returns Boolean indicating if the user is the owner
 */
export function isOwner(): boolean {
  const user = getCurrentUserFromHeaders();
  if (!user) {
    return false;
  }

  return user.role === 'OWNER' || user.role === 'SUPER_ADMIN';
}

/**
 * Check if the current user is a regular user
 * @returns Boolean indicating if the user is a regular user
 */
export function isUser(): boolean {
  const user = getCurrentUserFromHeaders();
  if (!user) {
    return false;
  }

  return user.role === 'USER' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'OWNER';
}

/**
 * Check if the current user belongs to the specified organization
 * @param organizationId The organization ID to check against
 * @returns Boolean indicating if the user belongs to the organization
 */
export function isInOrganization(organizationId: string): boolean {
  const user = getCurrentUserFromHeaders();
  
  if (!user) {
    return false;
  }

  return user.organizationId === organizationId;
}

/**
 * Check if the current user has access to a specific resource based on organization
 * This is useful for multi-tenancy to ensure users can only access their organization's data
 * @param resourceOrgId The organization ID of the resource
 * @returns Boolean indicating if the user has access to the resource
 */
export function canAccessResource(resourceOrgId: string): boolean {
  const user = getCurrentUserFromHeaders();
  
  if (!user) {
    return false;
  }

  // Super admins can access any resource
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Regular users can only access resources in their organization
  return user.organizationId === resourceOrgId;
}

/**
 * Role-based access control guard
 * @param requiredRole The minimum role required
 * @param organizationId Optional organization ID to check
 * @returns Boolean indicating if access is granted
 */
export function rbacGuard(requiredRole: UserRole, organizationId?: string): boolean {
  const hasRequiredRole = hasRole(requiredRole);
  
  if (!hasRequiredRole) {
    return false;
  }

  // If organization ID is provided, check if user belongs to that organization
  if (organizationId) {
    return canAccessResource(organizationId);
  }

  return true;
}

/**
 * Redirect to login if not authenticated
 */
export function requireAuth(): void {
  const user = getCurrentUserFromHeaders();
  if (!user) {
    redirect('/auth/login');
  }
}

/**
 * Redirect to unauthorized page if user doesn't have required role
 * @param requiredRole The minimum role required
 * @param organizationId Optional organization ID to check
 */
export function requireRole(requiredRole: UserRole, organizationId?: string): void {
  requireAuth();
  
  if (!rbacGuard(requiredRole, organizationId)) {
    redirect('/unauthorized');
  }
}

/**
 * Redirect to unauthorized page if user doesn't belong to the specified organization
 * @param organizationId The organization ID to check
 */
export function requireOrganization(organizationId: string): void {
  requireAuth();
  
  if (!isInOrganization(organizationId)) {
    redirect('/unauthorized');
  }
}