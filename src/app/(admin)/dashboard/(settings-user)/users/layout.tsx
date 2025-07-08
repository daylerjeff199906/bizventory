import { PageHeader } from '@/components/app/header-section'
// import { APP_URLS } from '@/config/app-urls'
// import { Plus } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Aquí puedes ver y gestionar los usuarios de tu tienda."
        // actionButton={{
        //   label: 'Agregar usuario',
        //   href: APP_URLS.USERS.CREATE,
        //   icon: <Plus className="h-4 w-4 mr-2" />
        // }}
      />
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </>
  )
}
