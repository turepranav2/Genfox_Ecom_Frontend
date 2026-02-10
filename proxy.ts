import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that should never be protected (login/register pages)
const publicPaths = [
  '/admin/login',
  '/supplier/login',
  '/supplier/register',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check for login/register pages
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value

  // Protect admin routes
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Protect supplier routes
  if (pathname.startsWith('/supplier') && !token) {
    return NextResponse.redirect(new URL('/supplier/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/supplier/:path*', '/cart', '/checkout', '/orders']
}