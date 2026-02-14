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
    <LayoutWrapper sectionTitle="Gestionar usuario">
      <div className="flex flex-col gap-4 w-full">
        <PageHeader
          title="Gestionar usuario"
          description="Aquí puedes ver y gestionar todas las marcas disponibles."
          backButton={{
            href: '/admin/users',
          }}
        />
        {children}
      </div>
    </LayoutWrapper>
  )
}
