import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { Params } from '@/types'
import { Plus } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  params: Params
}

export default async function Layout(props: LayoutProps) {
  const { children } = props
  const params = await props.params
  const uuid = params.uuid

  return (
    <>
      <LayoutWrapper>
        <PageHeader
          title="Compras realizadas"
          description="Aquí puedes ver todas las compras realizadas por los clientes."
          actionButton={{
            label: 'Registrar compra',
            href: APP_URLS.ORGANIZATION.PURCHASES.CREATE(
              uuid?.toString() || ''
            ),
            icon: <Plus className="h-4 w-4 mr-2" />
          }}
        />
        <div className="flex flex-col gap-4">{children}</div>
      </LayoutWrapper>
    </>
  )
}
