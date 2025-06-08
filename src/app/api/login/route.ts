// app/api/login/route.ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()

  try {
    const { email, password } = await req.json()

    // Corrección aquí - elimina los paréntesis adicionales y el await innecesario
    const { data, error } = await (
      await supabase
    ).auth.signInWithPassword({
      email,
      password
    })

    console.log('Data de autenticación:', data)
    console.log('Error de autenticación:', error)

    if (error) {
      return NextResponse.json(
        {
          error:
            'Credenciales inválidas. Por favor verifica tu email y contraseña.'
        },
        { status: 401 }
      )
    }

    return NextResponse.json({ user: data.user })
  } catch (error) {
    console.error('Error en la autenticación:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error durante la autenticación' },
      { status: 500 }
    )
  }
}
