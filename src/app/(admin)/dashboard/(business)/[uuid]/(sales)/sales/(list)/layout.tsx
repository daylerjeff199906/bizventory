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
      {' '}
      <LayoutWrapper sectionTitle="Gestión de compras">
        <PageHeader
          title="Ventas realizadas"
          description="Aquí puedes ver todas las ventas realizadas en tu tienda."
          actionButton={{
            label: 'Registrar venta',
            href: APP_URLS.SALES.CREATE(uuid?.toString() || ''),
            icon: <Plus className="h-4 w-4 mr-2" />
          }}
        />
        <div className="flex flex-col gap-4 container mx-auto">{props.children}</div>
      </LayoutWrapper>
    </>
  )
}
