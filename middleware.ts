import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/src/lib/auth/config'

// Define protected routes that require authentication
const protectedRoutes = [
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
  
  // Skip middleware for public routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/docs'
  ) {
    return NextResponse.next()
  }
  
  // Check disaster mode (ENV)
  if (process.env.DISASTER_MODE === 'true') {
    return NextResponse.redirect(new URL('/disaster', request.url))
  }
  
  // Get session
  const session = await auth.api.getSession({ headers: request.headers })
  
  if (!session) {
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}