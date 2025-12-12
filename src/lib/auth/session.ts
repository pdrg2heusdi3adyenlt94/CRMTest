import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * Get the current authenticated user session
 * @returns User session object if authenticated, null otherwise
 */
export async function getAuth() {
  try {
    // In a Next.js middleware or server component context, we need to extract session from headers
    // This function should be called in server components or API routes
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');
    const organizationId = headersList.get('x-organization-id');
    
    if (userId && userRole && organizationId) {
      return {
        user: {
          id: userId,
          role: userRole,
          organizationId: organizationId,
        },
      };
    }
    
    // Fallback to auth() method if headers aren't available
    const session = await auth();
    return session?.user ? session : null;
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}

/**
 * Check if the current user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getAuth();
  return !!session;
}

/**
 * Get user ID from the current session
 * @returns User ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getAuth();
  return session?.user?.id || null;
}

/**
 * Get user role from the current session
 * @returns User role if authenticated, null otherwise
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const session = await getAuth();
  return session?.user?.role || null;
}

/**
 * Get organization ID from the current session
 * @returns Organization ID if authenticated, null otherwise
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const session = await getAuth();
  return session?.user?.organizationId || null;
}