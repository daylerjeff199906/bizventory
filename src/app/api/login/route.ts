// app/api/login/route.ts
'use server'
import { createSupabaseSession } from '@/lib/session'
import { AuthResponse, Session, SupabaseUser } from '@/types'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()

  try {
    const { email, password } = await req.json()

    // Corrección aquí - elimina los paréntesis adicionales y el await innecesario
    const { data, error } = await (
      await supabase
    ).auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json(
        {
          error:
            'Credenciales inválidas. Por favor verifica tu email y contraseña.'
        },
        { status: 401 }
      )
    }

    // 1. Obtener perfil para verificar is_super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' },
        { status: 403 }
      )
    }

    // 2. Obtener negocios del usuario
    const { data: businesses } = await supabase
      .from('business_members')
      .select('*, business:business(*)')
      .eq('user_id', data.user.id)
      .eq('is_active', true)

    // Sincronizar metadata con perfil
    if (profile) {
      data.user.user_metadata = {
        ...data.user.user_metadata,
        is_super_admin: profile.is_super_admin,
        // firstName: profile.first_name,
        // lastName: profile.last_name,
      }
    }

    const authData: AuthResponse = {
      user: data.user as SupabaseUser | null,
      session: data.session as Session | null
    }
    await createSupabaseSession(authData)

    return NextResponse.json({
      user: data.user,
      profile,
      businesses: businesses?.map(b => b.business) || []
    })
  } catch (error) {
    console.error('Error en la autenticación:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error durante la autenticación' },
      { status: 500 }
    )
  }
}
