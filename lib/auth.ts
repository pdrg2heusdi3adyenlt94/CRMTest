import { auth } from '@/src/lib/auth/config';

/**
 * Get the current authenticated user session
 * @returns User session object if authenticated, null otherwise
 */
export async function getAuth() {
  try {
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