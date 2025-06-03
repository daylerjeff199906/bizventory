import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Crear nuevo Producto"
        description="Aquí puedes añadir un nuevo producto a tu inventario."
        backButton={{
          href: APP_URLS.PRODUCTS.LIST,
          hidden: false
        }}
      />
      {children}
    </div>
  )
}
