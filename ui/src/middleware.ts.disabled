import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that should be protected by authentication
const PROTECTED_PATHS = [
  '/api/protected/', // Only protect specific API routes
  '/dashboard',
  '/admin',
  '/settings',
];

// Add paths that should be allowed without authentication
const PUBLIC_PATHS = [
  '/api/auth', // NextAuth API routes (no trailing slash)
  '/auth/login',
  '/auth/register',
  '/_next',
  '/images',
  '/favicon.ico',
  '/test-effects',
  '/', // Allow homepage
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if path needs protection
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Get the authentication token
    const token = request.cookies.get('auth-token');

    if (!token) {
      // Redirect to login if no token is present
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      // Add your token verification logic here
      // This is just a basic example
      if (!token.value || token.value === 'invalid') {
        throw new Error('Invalid token');
      }

      // Add security headers
      const response = NextResponse.next();
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // Only allow specific origins
      const allowedOrigins = ['https://sirsinexus.com', 'http://localhost:3000'];
      const origin = request.headers.get('origin');
      
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }

      return response;
    } catch (error) {
      // Redirect to login on invalid token
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // For all other routes, proceed normally with security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}
