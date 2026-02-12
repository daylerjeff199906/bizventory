import 'server-only'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { AuthResponse, SupabaseUser, Session } from '@/types'

const secretKey = process.env.SESSION_SECRET
if (!secretKey) {
  throw new Error('SESSION_SECRET is not defined in environment variables')
}
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload extends JWTPayload {
  user: SupabaseUser
  session: Session
  expires: string
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256']
    })
    return payload as unknown as SessionPayload
  } catch (error) {
    console.error('Failed to verify session:', error)
    return null
  }
}

export async function createSupabaseSession(authData: AuthResponse) {
  if (!authData.user || !authData.session) {
    throw new Error('Invalid authentication data')
  }

  const cookieStore = await cookies()

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
  const sessionPayload: SessionPayload = {
    user: authData.user,
    session: authData.session,
    expires: expires.toISOString()
  }

  const sessionToken = await encrypt(sessionPayload)

  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
    sameSite: 'lax'
  })

  return sessionPayload
}

export async function getSupabaseSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  if (!sessionToken) return null

  return await decrypt(sessionToken)
}

export async function deleteSupabaseSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
