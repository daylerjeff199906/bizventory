// actions/auth.ts
'use server'
import { deleteSupabaseSession } from '@/lib/session'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = createClient()

  // 1. Cerrar sesión en Supabase
  await (await supabase).auth.signOut()

  // 2. Eliminar sesión JWT
  deleteSupabaseSession()

  // 3. Redirigir
  redirect('/login')
}
