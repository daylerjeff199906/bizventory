import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 md:p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Detalles de la venta"
        description="Aquí puedes ver los detalles de la venta, incluyendo los productos, cantidades y precios."
        backButton={{
          href: APP_URLS.SALES.LIST,
          hidden: false
        }}
      />
      <div className="flex flex-col gap-4 container max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  )
}
