import { NavBarCustom } from '@/components/panel-admin/nav-bar-custom'
import { APP_URLS } from '@/config/app-urls'
import { getSupabase } from '@/services/core.supabase'
import { redirect } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
}

export default async function Layout(props: LayoutProps) {
  const { children } = props
  const supabase = await getSupabase()
  const { data: user } = await supabase.auth.getUser()

  if (!user) {
    // Si no hay usuario, redirigir a la página de login
    redirect(APP_URLS.AUTH.LOGIN)
  }

  // Si hay sesión, continuar con el flujo normal
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.user?.id)
    .maybeSingle()

  return (
    <div className="flex h-screen w-screen flex-col">
      <NavBarCustom
        email={user?.user?.email || ''}
        userName={profile?.name || 'Usuario'}
        urlPhoto={user?.user?.user_metadata.avatar_url || ''}
      />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 flex-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 px-6 mt-4">
            Mis negocios
          </h2>
        </div>
        {children}
      </div>
    </div>
  )
}
