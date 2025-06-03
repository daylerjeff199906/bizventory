import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'
import { Plus } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Lista de Productos"
        description="Aquí puedes ver y gestionar todos los productos disponibles."
        actionButton={{
          label: 'Añadir Producto',
          href: APP_URLS.PRODUCTS.CREATE,
          icon: <Plus className="h-4 w-4 mr-2" />
        }}
      />
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
      <div className="mt-4">
        {/* Footer or additional content can go here */}
      </div>
    </div>
  )
}
