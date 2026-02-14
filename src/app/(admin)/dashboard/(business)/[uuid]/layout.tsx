import { AppSidebar } from '@/components/app-sidebar'
import { adminNavMain } from '@/components/menus-sidebar'
import { TeamSwitcherType } from '@/components/team-switcher'
import { SidebarProvider } from '@/components/ui/sidebar'
import { APP_URLS } from '@/config/app-urls'
import { getSupabase } from '@/services/core.supabase'
import { getBusinessesByUserRole } from '@/services/user.roles.services'
import { Params } from '@/types'
import { redirect } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
  params: Params
}

export default async function Layout(props: LayoutProps) {
  const params = await props.params
  const { children } = props
  const uuid = params.uuid
  const supabase = await getSupabase()
  const { data: user } = await supabase.auth.getUser()

  if (!user) {
    // Si no hay usuario, redirigir a la página de login
    redirect(APP_URLS.AUTH.LOGIN)
  }

  // Si hay sesión, continuar con el flujo normal
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.user?.id)
    .maybeSingle()

  const userData = profile
    ? {
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuario',
      email: user?.user?.email || '',
      avatar: user?.user?.user_metadata.avatar_url || ''
    }
    : null

  const responseData = await getBusinessesByUserRole(user?.user?.id || '')

  const teamSwitcherData: TeamSwitcherType[] = responseData.map((business) => ({
    name: business.business_name || 'Sin nombre',
    plan: business.business_type || 'Sin plan',
    url_logo: business.brand || undefined,
    href: APP_URLS.ORGANIZATION.BASE.HOME(business.id || '')
  }))

  return (
    <SidebarProvider>
      <AppSidebar
        userData={userData}
        menuTeamSwitcher={teamSwitcherData || []}
        menuNavBar={{
          navMain: adminNavMain(uuid?.toString() || '')
        }}
      />
      {children}
    </SidebarProvider>
  )
}
