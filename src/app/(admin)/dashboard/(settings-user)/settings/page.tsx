import { CompanyManagement } from '@/modules/settings'
import { getCompanyInfoById } from '@/apis/app'

const UUID = '4beae67e-790c-4140-89f8-4bd3f1c9c122' // Reemplazar con el UUID real

export default async function Page() {
  const companyInfo = await getCompanyInfoById(UUID)

  if (!companyInfo) {
    return <div>Error: Company information not found.</div>
  }

  return (
    <>
      <CompanyManagement company={companyInfo} />
    </>
  )
}
