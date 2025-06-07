import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Detalles de Compra | Impresión de Recibo"
        description="Consulta la información detallada de la compra y descarga el recibo correspondiente."
        backButton={{
          href: APP_URLS.PURCHASES.LIST,
          hidden: false
        }}
      />
      <div className="flex flex-col gap-4 container max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  )
}
