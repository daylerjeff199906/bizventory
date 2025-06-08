// app/api/logout/route.ts
'use server'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { deleteSupabaseSession } from '@/lib/session'
export async function POST() {
  try {
    const supabase = createClient()

    // 1. Cerrar sesión en Supabase
    const { error } = await (await supabase).auth.signOut()

    if (error) {
      console.error('Error al cerrar sesión en Supabase:', error)
      // No retornes error aquí para asegurar que se borre la sesión JWT
    }

    // 2. Eliminar sesión JWT
    deleteSupabaseSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en el logout:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error al cerrar sesión' },
      { status: 500 }
    )
  }
}
