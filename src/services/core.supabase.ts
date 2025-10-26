'use server'
import { createClient } from '@/utils/supabase/server'

export async function getSupabase() {
  const supabase = createClient()
  return supabase
}
