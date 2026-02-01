import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { Params } from '@/types'
import { Plus } from 'lucide-react'
interface Props {
  params: Params
  children: React.ReactNode
}

export default async function Layout(props: Props) {
  const params = await props.params
  const uuid = params.uuid


  return (
    <>
      <LayoutWrapper sectionTitle="Detalles de la venta">
        <PageHeader
          title="Detalles de la venta"
          description="Aquí puedes ver los detalles de la venta realizada."
          backButton={{
            href: APP_URLS.SALES.LIST(uuid?.toString() || ''),
          }}
        />
        <div className="flex flex-col gap-4 container mx-auto">{props.children}</div>
      </LayoutWrapper>
    </>
  )
}
