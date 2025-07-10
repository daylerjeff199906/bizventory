import { PageHeader } from '@/components/app/header-section'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PersonsCRUD } from '@/modules/customers'
import { TriangleAlert } from 'lucide-react'
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
      <div>
        <PersonsCRUD isCustomer />
      </div>
      <div>
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>
            <p>
              No es recomendable eliminar el registro de{' '}
              <strong>CLIENTE VARIOS</strong>, ya que es utilizado para ventas
              rápidas o clientes no identificados.
            </p>
          </AlertDescription>
        </Alert>
      </div>
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </>
  )
}
