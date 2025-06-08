// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseSession } from './lib/session'

export async function middleware(request: NextRequest) {
  const session = await getSupabaseSession()

  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
