import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { FiltersProducts } from '@/modules/products'
import { Params } from '@/types'
import { Plus } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  params: Params
}

export default async function Layout(props: LayoutProps) {
  const params = await props.params
  const { children } = props

  const uuid = params.uuid

  return (
    <LayoutWrapper sectionTitle="Gestión de Productos">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Lista de Productos"
          description="Aquí puedes ver y gestionar todos los productos disponibles."
          actionButton={{
            label: 'Añadir Producto',
            href: APP_URLS.ORGANIZATION.PRODUCTS.CREATE(uuid?.toString() || ''),
            icon: <Plus className="h-4 w-4 mr-2" />
          }}
        />
        <FiltersProducts />
        {children}
      </div>
    </LayoutWrapper>
  )
}
