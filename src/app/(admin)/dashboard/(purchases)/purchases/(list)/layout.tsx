import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'
import { Plus } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Compras realizadas"
        description="Aquí puedes ver todas las compras realizadas por los clientes."
        actionButton={{
          label: 'Registrar compra',
          href: APP_URLS.PURCHASES.CREATE,
          icon: <Plus className="h-4 w-4 mr-2" />
        }}
      />
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </div>
  )
}
