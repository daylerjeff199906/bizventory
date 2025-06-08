import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Registrar nueva compra"
        description="Aquí puedes registrar una nueva compra para mantener un control de tus adquisiciones."
        backButton={{
          href: APP_URLS.PURCHASES.LIST,
          hidden: false
        }}
      />
      {children}
    </div>
  )
}
