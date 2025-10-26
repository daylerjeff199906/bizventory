import { BusinessesPage } from '@/modules/business/pages'
import { getSupabase } from '@/services/core.supabase'
import { getBusinessesByUserRole } from '@/services/user.roles.services'

export default async function Page() {
  const supabase = await getSupabase()
  const { data: user } = await supabase.auth.getUser()
  const responseData = await getBusinessesByUserRole(user?.user?.id || '')

  return <BusinessesPage businessesList={responseData} />
}
