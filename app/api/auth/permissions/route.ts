import { NextRequest } from 'next/server';
import { getCurrentUserFromHeaders } from '@/src/lib/auth/server';
import { UserRole } from '@/src/types/user';

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUserFromHeaders();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const requiredRole = searchParams.get('role') as UserRole | null;
    const organizationId = searchParams.get('organizationId');

    // Check if user has the required role
    let hasRequiredRole = true; // Default to true if no role specified
    if (requiredRole) {
      hasRequiredRole = checkRole(user.role, requiredRole);
    }

    // Check if user belongs to the specified organization
    let hasOrganizationAccess = true; // Default to true if no org specified
    if (organizationId) {
      hasOrganizationAccess = user.organizationId === organizationId;
    }

    const hasAccess = hasRequiredRole && hasOrganizationAccess;

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: user.id,
          role: user.role,
          organizationId: user.organizationId,
        },
        hasAccess,
        hasRequiredRole,
        hasOrganizationAccess,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking permissions:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Check if a user role has the required role based on hierarchy
 */
function checkRole(userRole: UserRole, requiredRole: UserRole): boolean {
  // Define role hierarchy - SUPER_ADMIN has access to everything
  const roleHierarchy: Record<UserRole, number> = {
    SUPER_ADMIN: 4,
    OWNER: 3,
    ADMIN: 2,
    USER: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}