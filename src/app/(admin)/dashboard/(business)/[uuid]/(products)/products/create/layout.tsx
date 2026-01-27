import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { Params } from '@/types'
interface LayoutProps {
  children: React.ReactNode
  params: Params
}

export default async function Layout(props: LayoutProps) {
  const params = await props.params
  const { children } = props
  return (
    <LayoutWrapper sectionTitle="Crear Nuevo Producto">
      <div className="flex flex-col gap-4 p-4 max-w-3xl w-full">
        <PageHeader
          title="Crear nuevo Producto"
          description="Aquí puedes añadir un nuevo producto a tu inventario."
          backButton={{
            href: APP_URLS.ORGANIZATION.PRODUCTS.LIST(
              params.uuid?.toString() || ''
            ),
            hidden: false
          }}
        />
        {children}
      </div>
    </LayoutWrapper>
  )
}
