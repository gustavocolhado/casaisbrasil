import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const pathname = request.nextUrl.pathname

  // Se não está logado e tenta acessar páginas protegidas, redirecionar para landing
  if (!isAuth && pathname.startsWith('/(authenticated)')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se está logado e acessa a landing page, redirecionar para home
  if (isAuth && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Se está logado e tenta acessar login/register, redirecionar para home
  if (isAuth && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 