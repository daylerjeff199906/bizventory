// actions/auth.ts
'use server'
import { deleteSupabaseSession } from '@/lib/session'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()

  // 1. Cerrar sesión en Supabase
  await supabase.auth.signOut()

  // 2. Eliminar sesión JWT de Bizventory
  await deleteSupabaseSession()

  // 3. Redirigir al login
  redirect('/login')
}
