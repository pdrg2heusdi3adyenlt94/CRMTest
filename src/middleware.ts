import { NextRequest, NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/accounts', '/contacts', '/deals'];

export function middleware(request: NextRequest) {
  // If the route is protected, check for session
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    // Get session from cookies/localStorage
    // In a real app, you'd verify the JWT token here
    const sessionId = request.cookies.get('sessionId');
    
    // For now, we'll just check if there's a session ID
    // In a real application, you would validate the token with your auth service
    if (!sessionId) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  
  return NextResponse.next();
}

// Specify which paths the middleware should run for
export const config = {
  matcher: ['/dashboard/:path*', '/accounts/:path*', '/contacts/:path*', '/deals/:path*'],
};