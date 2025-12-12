import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/',
  '/dashboard',
  '/accounts',
  '/contacts',
  '/deals',
  '/projects',
  '/tasks',
  '/settings',
  '/admin',
  '/api',
]

// Define admin-only routes
const adminRoutes = [
  '/admin',
  '/api/admin',
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for truly public routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/about' ||
    pathname === '/docs'
  ) {
    return NextResponse.next()
  }
  
  // Handle root route separately to allow mock session in development
  if (pathname === '/') {
    if (process.env.NODE_ENV === 'development') {
      // In development, redirect to dashboard directly without requiring session
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // In production, redirect to auth if accessing root
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Check disaster mode (ENV)
  if (process.env.DISASTER_MODE === 'true') {
    return NextResponse.redirect(new URL('/disaster', request.url))
  }
  
  // For development, we'll simulate authentication by checking for a mock session
  let session = null;
  
  // In development, if we're not on auth pages, allow access with mock session
  if (process.env.NODE_ENV === 'development' && !pathname.startsWith('/auth')) {
    // Simulate a mock session for development
    session = {
      user: {
        id: 'mock-user-id',
        email: 'admin@example.com',
        name: 'Mock User',
        role: 'ADMIN',
        organizationId: 'mock-org-id'
      }
    };
  }


  
  if (!session) {
    // Don't redirect to auth if we're already on an auth page
    if (pathname.startsWith('/auth')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Check if the route requires admin access
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isAdminRoute) {
    const userRole = session.user.role;
    
    // Only SUPER_ADMIN, OWNER, and ADMIN can access admin routes
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN' && userRole !== 'OWNER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // Validate organization context
  const organizationId = session.user.organizationId
  if (!organizationId && pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
  
  // Add user claims to headers for Server Components
  const response = NextResponse.next()
  response.headers.set('x-user-id', session.user.id)
  response.headers.set('x-organization-id', organizationId)
  response.headers.set('x-user-role', session.user.role)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}