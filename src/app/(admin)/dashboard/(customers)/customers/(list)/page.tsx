import { getCustomers } from '@/apis/app'
import { CustomersList } from '@/modules/customers/pages'

export default async function Page() {
  const customers = await getCustomers({})

  return <CustomersList customersList={customers.data} />
}

export const dynamic = 'force-dynamic' // Forzar revalidación en cada solicitud
