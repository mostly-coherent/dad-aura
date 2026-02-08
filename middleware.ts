import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/sms-webhook', // Vonage needs to reach this
  '/api/login',       // Login endpoint
  '/api/logout',      // Logout endpoint
] as const;

export function middleware(request: NextRequest) {
  try {
    // Validate request structure
    if (!request || !request.nextUrl) {
      console.error('Invalid request object in middleware');
      return NextResponse.next();
    }

    const { pathname } = request.nextUrl;
    
    // Validate pathname
    if (typeof pathname !== 'string') {
      console.error('Invalid pathname in middleware');
      return NextResponse.next();
    }

    // Allow public routes
    if (Array.isArray(PUBLIC_ROUTES) && PUBLIC_ROUTES.some(route => {
      try {
        return typeof route === 'string' && pathname.startsWith(route);
      } catch {
        return false;
      }
    })) {
      return NextResponse.next();
    }

    // Check for auth cookie
    let isAuthenticated = false;
    try {
      const authCookie = request.cookies.get('dad-aura-auth');
      isAuthenticated = authCookie?.value === 'authenticated';
    } catch (cookieError) {
      console.error('Error reading auth cookie:', cookieError);
      // Fail open - allow request if cookie reading fails
      isAuthenticated = false;
    }

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !pathname.startsWith('/login')) {
      try {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      } catch (urlError) {
        console.error('Error constructing login URL:', urlError);
        // Fail open - allow request if URL construction fails
        return NextResponse.next();
      }
    }

    // If authenticated and trying to access login page, redirect to home
    if (isAuthenticated && pathname === '/login') {
      try {
        return NextResponse.redirect(new URL('/', request.url));
      } catch (urlError) {
        console.error('Error constructing home URL:', urlError);
        // Fail open - allow request if URL construction fails
        return NextResponse.next();
      }
    }

    // Rolling cookie refresh — extend 2-day expiry on every request
    if (isAuthenticated) {
      const response = NextResponse.next();
      response.cookies.set('dad-aura-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 2, // 2 days
        path: '/',
      });
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    // Fail open - better to allow requests than block everything on middleware error
    console.error('Middleware error (failing open):', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

