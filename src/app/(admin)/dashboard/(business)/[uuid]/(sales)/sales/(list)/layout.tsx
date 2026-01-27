import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { Plus } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {' '}
      <LayoutWrapper sectionTitle="Gestión de compras">
        <PageHeader
          title="Ventas realizadas"
          description="Aquí puedes ver todas las ventas realizadas en tu tienda."
          actionButton={{
            label: 'Registrar venta',
            href: APP_URLS.SALES.CREATE,
            icon: <Plus className="h-4 w-4 mr-2" />
          }}
        />
        <div className="flex flex-col gap-4 container mx-auto">{children}</div>
      </LayoutWrapper>
    </>
  )
}
