import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { Params } from '@/types'

interface LayoutProps {
  children: React.ReactNode
  params: Params
}

export default async function Layout(props: LayoutProps) {
  const { children } = props
  const params = await props.params
  const uuid = params.uuid

  return (
    <LayoutWrapper sectionTitle="Gestión de compras">
      <PageHeader
        title="Detalles de Compra"
        description="Aquí puedes ver los detalles de la compra, incluyendo los productos adquiridos y sus cantidades."
        backButton={{
          href: APP_URLS.ORGANIZATION.PURCHASES.LIST(uuid?.toString() || ''),
          hidden: false
        }}
      />
      <div className="w-full max-w-4xl mx-auto pt-4">{children}</div>
    </LayoutWrapper>
  )
}
