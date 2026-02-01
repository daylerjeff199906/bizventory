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
    <LayoutWrapper sectionTitle="Registrar Venta">
      <div className="flex flex-col gap-4 w-full">
        <PageHeader
          title="Registrar Venta"
          description="Aquí puedes registrar una nueva venta."
          backButton={{
            href: `/dashboard/${uuid}/sales`,
          }}
        />
        {children}
      </div>
    </LayoutWrapper>
  )
}
