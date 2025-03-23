import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for auth cookie or token
  const isAuthenticated = request.cookies.has('KEYCLOAK_SESSION');
  
  // Public routes - allow access
  const publicPaths = ['/', '/login', '/register'];
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Protected routes - redirect to login if not authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/applications/:path*', '/settings/:path*'],
};
