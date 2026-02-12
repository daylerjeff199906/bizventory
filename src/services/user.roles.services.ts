'use server'
import { BusinessForm } from '@/schemas/business'
import { getSupabase } from './core.supabase'
import { IUser, IUserRoleFull } from '@/types'
import { revalidatePath } from 'next/cache'

// const modelName = 'user_roles'

export async function getBusinessesByUserRole(
  userId: string
): Promise<BusinessForm[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('business_members')
    .select('business:businesses(*)')
    .eq('user_id', userId)
    .eq('is_active', true) // Filter only active memberships

  if (error) {
    console.error('Error fetching businesses:', error)
    return []
  }

  // Flatten the result to return only businesses
  // data is { business: { ... } }[]
  // we want BusinessForm[]
  // Ensure we map correctly
  return data?.map((row: any) => row.business).filter(Boolean) ?? []
}

export async function getFullUserRoleByBusiness(
  businessId: string
): Promise<IUserRoleFull[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('business_members')
    .select('*, user:profiles(*)')
    .eq('business_id', businessId)
  if (error) {
    console.error('Error fetching user roles:', error)
    return []
  }
  return data ?? []
}

export async function getUsersPagintion({
  page,
  pageSize,
  query
}: {
  page: number
  pageSize?: number
  query?: string
}): Promise<{ users: IUser[]; total: number }> {
  const supabase = await getSupabase()
  let queryBuilder = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range((page - 1) * (pageSize || 10), page * (pageSize || 10) - 1)
  if (query) {
    queryBuilder = queryBuilder.ilike('user.email', `%${query}%`)
  }
  const { data, error, count } = await queryBuilder
  if (error) {
    console.error('Error fetching paginated users:', error)
    return { users: [], total: 0 }
  }
  return { users: data ?? [], total: count ?? 0 }
}

export async function upsertUserRole({
  idRole,
  businessId,
  userId,
  role,
  urlRevalidate
}: {
  idRole: string
  userId: string
  businessId: string
  role: 'institution_owner' | 'member' | 'editor'
  urlRevalidate?: string
}): Promise<{ data: IUserRoleFull | null; error: Error | null }> {
  const supabase = await getSupabase()
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        id: idRole,
        user_id: userId,
        business_id: businessId,
        role
      })
      .select('*, user:user_id(*)')
      .single()
    if (error) {
      console.error('Error upserting user role:', error)
      return { data: null, error }
    }

    revalidatePath(urlRevalidate || '/portal/business/users')
    return { data: data as IUserRoleFull, error: null }
  } catch (err) {
    console.error('Unexpected error upserting user role:', err)
    return { data: null, error: err as Error }
  }
}

export async function upsertAccessEnabled({
  userRoleId,
  userId,
  businessId,
  access_enabled,
  role,
  urlRevalidate
}: {
  userRoleId?: string
  userId: string
  businessId: string
  access_enabled: boolean
  role: 'institution_owner' | 'member' | 'editor'
  urlRevalidate?: string
}): Promise<{ data: IUserRoleFull | null; error: Error | null }> {
  const supabase = await getSupabase()
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        id: userRoleId,
        user_id: userId,
        role,
        business_id: businessId,
        access_enabled
      })
      .select('*, user:user_id(*)')
      .single()
    if (error) {
      console.error('Error upserting access enabled:', error)
      return { data: null, error }
    }
    revalidatePath(urlRevalidate || '/portal/business/users')
    return { data: data as IUserRoleFull, error: null }
  } catch (err) {
    console.error('Unexpected error upserting access enabled:', err)
    return { data: null, error: err as Error }
  }
}

export async function createUserRole({
  userId,
  businessId,
  role,
  urlRevalidate
}: {
  userId: string
  businessId: string
  role: 'institution_owner' | 'member' | 'editor'
  urlRevalidate?: string
}): Promise<{ data: IUserRoleFull | null; error: Error | null }> {
  const supabase = await getSupabase()
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        business_id: businessId,
        role
      })
      .select('*, user:user_id(*)')
      .single()
    if (error) {
      console.error('Error creating user role:', error)
      return { data: null, error }
    }

    revalidatePath(urlRevalidate || '/portal/business/users')
    return { data: data as IUserRoleFull, error: null }
  } catch (err) {
    console.error('Unexpected error creating user role:', err)
    return { data: null, error: err as Error }
  }
}
