import { auth } from '@/lib/auth/config';
import { cookies } from 'next/headers';

/**
 * Get the current authenticated user session
 * @returns User session object if authenticated, null otherwise
 */
export async function getAuth() {
  try {
    // Extract session token from cookies
    const sessionToken = cookies().get('better-auth.session_token');
    
    if (!sessionToken) {
      return null;
    }

    // Make a request to the session API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/get-session`, {
      headers: {
        cookie: `${sessionToken.name}=${sessionToken.value}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.session || null;
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