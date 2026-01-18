import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routeConfig } from '@/config/routes'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { user, response } = await updateSession(request)

  // Check if public route
  const isPublicRoute = routeConfig.public.some(
    route => pathname.startsWith(route)
  )

  if (isPublicRoute) {
    // Logged in user accessing login page -> redirect to board
    if (user) {
      return NextResponse.redirect(new URL(routeConfig.defaultRedirect, request.url))
    }
    return response
  }

  // Not logged in accessing protected route
  if (!user) {
    const loginUrl = new URL(routeConfig.loginRedirect, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
