import { auth } from '@/src/lib/auth/config';

/**
 * Get the current authenticated user session
 * @returns User session object if authenticated, null otherwise
 */
export async function getAuth() {
  try {
    // In a Next.js middleware or server component context, we need to extract session from headers
    // This function should be called in server components or API routes
    const request = getCurrentRequest();
    if (request) {
      // Try to get session from headers if available (set by middleware)
      const userId = request.headers.get('x-user-id');
      const userRole = request.headers.get('x-user-role');
      const organizationId = request.headers.get('x-organization-id');
      
      if (userId && userRole && organizationId) {
        return {
          user: {
            id: userId,
            role: userRole,
            organizationId: organizationId,
          },
        };
      }
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

// Helper function to get current request in server components
function getCurrentRequest(): Request | undefined {
  try {
    // This is a workaround to access the current request in server components
    // In Next.js 13+, we can use React's context or other methods
    // For now, we'll return undefined and rely on headers
    return undefined;
  } catch (error) {
    return undefined;
  }
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