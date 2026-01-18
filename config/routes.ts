export const routeConfig = {
  // Public routes (no auth required)
  public: [
    '/login',
    '/register',
    '/reset-password',
  ],

  // Protected routes (auth required)
  protected: [
    '/board',
    '/reports',
    '/settings',
  ],

  // Admin routes (admin role required)
  admin: [
    '/admin',
    '/admin/tags',
    '/admin/templates',
    '/admin/users',
  ],

  // Redirects
  defaultRedirect: '/board',
  loginRedirect: '/login',
}

export const middlewareConfig = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
}
