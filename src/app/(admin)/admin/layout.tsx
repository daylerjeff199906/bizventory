import { getSupabaseSession } from '@/lib/session'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { superAdminNavMain } from '@/components/menus-sidebar'
import { APP_URLS } from '@/config/app-urls'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const sessionData = await getSupabaseSession()
    if (!sessionData?.user) {
        redirect(APP_URLS.AUTH.LOGIN)
    }

    const supabase = await createClient()
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_super_admin, first_name, last_name, email, avatar_url')
        .eq('id', sessionData.user.id)
        .single()

    // If error (e.g., profile doesn't exist yet) or not super admin, deny access
    if (error || !profile?.is_super_admin) {
        redirect(APP_URLS.BASE)
    }

    const userData = {
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Admin',
        email: profile.email || sessionData.user.email,
        avatar: profile.avatar_url || ''
    }

    return (
        <SidebarProvider>
            <AppSidebar
                userData={userData}
                menuTeamSwitcher={[]} // No team switcher for super admin view usually, or maybe we want to see all businesses
                menuNavBar={{
                    navMain: superAdminNavMain()
                }}
            />
            <main className="flex-1 overflow-auto bg-muted/10 p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
