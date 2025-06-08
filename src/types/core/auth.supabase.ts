interface Identity {
  identity_id: string
  id: string
  user_id: string
  identity_data?: {
    email?: string
    sub?: string
  }
  provider: string
  last_sign_in_at: string
  created_at: string
  updated_at: string
}

interface AppMetadata {
  provider: string
  providers: string[]
}

interface UserMetadata {
  email_verified: boolean
}

export interface SupabaseUser {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: string
  phone: string
  confirmed_at: string
  last_sign_in_at: string
  app_metadata: AppMetadata
  user_metadata: UserMetadata
  identities: Identity[]
  created_at: string
  updated_at: string
  is_anonymous: boolean
}

// Tipo para la respuesta de autenticación
export interface AuthResponse {
  user: SupabaseUser | null
  session: Session | null
  error?: {
    message: string
    status?: number
    __isAuthError?: boolean
  }
}

// Tipo para la sesión (puedes expandirlo según necesites)
export interface Session {
  access_token: string
  token_type: string
  expires_in: number
  expires_at?: number
  refresh_token: string
  user: SupabaseUser
}
