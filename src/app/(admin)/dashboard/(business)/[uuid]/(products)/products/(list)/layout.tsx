import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { FiltersProducts } from '@/modules/products'
import { Plus } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper sectionTitle="Gestión de Productos">
      <div className="flex flex-col gap-4  bg-white dark:bg-gray-800">
        <PageHeader
          title="Lista de Productos"
          description="Aquí puedes ver y gestionar todos los productos disponibles."
          actionButton={{
            label: 'Añadir Producto',
            href: APP_URLS.PRODUCTS.CREATE,
            icon: <Plus className="h-4 w-4 mr-2" />
          }}
        />
        <FiltersProducts />
        {children}
      </div>
    </LayoutWrapper>
  )
}
