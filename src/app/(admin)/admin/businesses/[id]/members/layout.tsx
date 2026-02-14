import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { FiltersProducts, HeaderBrands } from '@/modules/products'
import { Params } from '@/types'

interface LayoutProps {
  children: React.ReactNode
  params: Params
}

export default async function Layout(props: LayoutProps) {
  const params = await props.params
  const { children } = props

  const uuid = params.uuid

  return (
    <LayoutWrapper sectionTitle="Gestionar Miemros">
      <div className="flex flex-col gap-4 w-full">
        <PageHeader
          title="Gestionar usuario"
          description="Aquí puedes ver y gestionar los miembros del negocio."
          backButton={{
            href: '/admin/businesses',
          }}
        />
        {children}
      </div>
    </LayoutWrapper>
  )
}
