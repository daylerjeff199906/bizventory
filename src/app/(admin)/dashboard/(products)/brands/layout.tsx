import { PageHeader } from '@/components/app/header-section'
import { FiltersProducts, HeaderBrands } from '@/modules/products'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Lista de Marcas"
        description="Aquí puedes ver y gestionar todas las marcas disponibles."
      />
      <HeaderBrands />
      <FiltersProducts placeholder="Buscar marcas por nombre..." />
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </div>
  )
}
