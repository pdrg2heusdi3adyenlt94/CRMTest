'use client';

import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  organizationId?: string;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Higher-order component to protect routes based on user role and organization
 */
export default function ProtectedRoute({
  children,
  requiredRole = 'USER',
  organizationId,
  redirectTo = '/auth/login',
  fallback = null,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'loading') return; // Still loading, don't redirect yet
    
    if (status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    if (status === 'authenticated' && session.user) {
      // Check role permissions
      const userRole = session.user.role as UserRole;
      
      // Define role hierarchy
      const roleHierarchy: Record<UserRole, number> = {
        SUPER_ADMIN: 4,
        OWNER: 3,
        ADMIN: 2,
        USER: 1,
      };

      // Check if user has required role
      const hasRequiredRole = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
      
      if (!hasRequiredRole) {
        router.push('/unauthorized');
        return;
      }

      // Check organization access if organizationId is provided
      if (organizationId && session.user.organizationId !== organizationId) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [status, session, requiredRole, organizationId, redirectTo, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || 
      (status === 'authenticated' && session?.user && 
       !checkPermissions(session.user, requiredRole, organizationId))) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Helper function to check user permissions
 */
function checkPermissions(
  user: any, 
  requiredRole: UserRole, 
  organizationId?: string
): boolean {
  if (!user) return false;

  // Define role hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    SUPER_ADMIN: 4,
    OWNER: 3,
    ADMIN: 2,
    USER: 1,
  };

  const userRole = user.role as UserRole;
  const hasRequiredRole = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  
  if (!hasRequiredRole) return false;

  // Check organization access if needed
  if (organizationId && user.organizationId !== organizationId) {
    return false;
  }

  return true;
}