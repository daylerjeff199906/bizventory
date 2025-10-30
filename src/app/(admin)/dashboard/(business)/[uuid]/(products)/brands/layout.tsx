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
    <LayoutWrapper sectionTitle="Gestión de Marcas">
      <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 w-full">
        <PageHeader
          title="Lista de Marcas"
          description="Aquí puedes ver y gestionar todas las marcas disponibles."
        />
        <HeaderBrands businessId={uuid?.toString() || ''} />
        <FiltersProducts placeholder="Buscar marcas por nombre..." />
        {children}
      </div>
    </LayoutWrapper>
  )
}
