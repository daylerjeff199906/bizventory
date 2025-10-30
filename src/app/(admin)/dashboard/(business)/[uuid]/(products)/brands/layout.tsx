import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { FiltersProducts, HeaderBrands } from '@/modules/products'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper sectionTitle="Gestión de Marcas">
      <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 w-full">
        <PageHeader
          title="Lista de Marcas"
          description="Aquí puedes ver y gestionar todas las marcas disponibles."
        />
        <HeaderBrands />
        <FiltersProducts placeholder="Buscar marcas por nombre..." />
        <div className="flex flex-col gap-4 w-full">{children}</div>
      </div>
    </LayoutWrapper>
  )
}
