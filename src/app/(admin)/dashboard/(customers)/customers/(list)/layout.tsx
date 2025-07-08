import { PageHeader } from '@/components/app/header-section'
import { PersonsCRUD } from '@/modules/customers'
// import { APP_URLS } from '@/config/app-urls'
// import { Plus } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader
        title="Clientes registrados"
        description="Aquí puedes ver y gestionar todos los clientes registrados en el sistema."
        // actionButton={{
        //   label: 'Registrar venta',
        //   href: APP_URLS.SALES.CREATE,
        //   icon: <Plus className="h-4 w-4 mr-2" />
        // }}
      />
      <PersonsCRUD />
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </>
  )
}
