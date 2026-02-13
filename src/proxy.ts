import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupabaseSession } from './lib/session'

export async function proxy(request: NextRequest) {
  const session = await getSupabaseSession()

  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
