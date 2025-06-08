import SidebarLayout from '@/components/sidebar-layout'
import { getSupabaseSession } from '@/lib/session'
import { SupabaseUser } from '@/types'

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getSupabaseSession()

  if (!session) {
    // Redirigir a la página de inicio de sesión si no hay sesión
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirigiendo a la página de inicio de sesión...</p>
      </div>
    )
  }

  const user = session.user as SupabaseUser

  return (
    <SidebarLayout
      user={{
        name: user.email,
        email: user.email,
        role: 'Administrador', // Puedes obtener esto de tu DB
        avatarUrl:   '/placeholder-user.jpg'
      }}
    >
      <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
    </SidebarLayout>
  )
}
