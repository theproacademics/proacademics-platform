// Middleware is disabled for demo purposes
// In production, implement proper authentication and authorization

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Allow access to auth pages without authentication
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }

    // Redirect to signin if not authenticated and trying to access protected routes
    if (!token && pathname !== '/auth/signin' && pathname !== '/auth/signup') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Admin routes protection
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Teacher routes protection  
    if (pathname.startsWith('/teacher') && !['teacher', 'admin'].includes(token?.role as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow public routes
        if (pathname.startsWith('/auth/') || 
            pathname.startsWith('/api/auth/') ||
            pathname.startsWith('/api/debug/') ||
            pathname.startsWith('/api/admin/homework') ||
            pathname.startsWith('/api/admin/subjects') ||
            pathname.startsWith('/api/admin/lessons') ||
            pathname.startsWith('/api/admin/students') ||
            pathname === '/unauthorized') {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js)
     * - api/admin/homework (public homework API)
     * - api/admin/subjects (public subjects API)
     * - api/admin/students (public students API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|api/admin/homework|api/admin/subjects|api/admin/lessons|api/admin/students|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
