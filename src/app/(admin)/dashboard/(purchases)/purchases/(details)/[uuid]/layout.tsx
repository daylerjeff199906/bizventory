import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 md:p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Detalles de Compra"
        description="Aquí puedes ver los detalles de la compra, incluyendo los productos adquiridos y sus cantidades."
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
