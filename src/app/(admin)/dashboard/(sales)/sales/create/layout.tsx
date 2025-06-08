import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Registrar nueva venta"
        description="Aquí puedes registrar una nueva venta para mantener un control de tus transacciones."
        backButton={{
          href: APP_URLS.SALES.LIST,
          hidden: false
        }}
      />
      {children}
    </div>
  )
}
