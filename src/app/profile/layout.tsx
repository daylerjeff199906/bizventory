import { getSupabaseSession } from '@/lib/session'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { APP_URLS } from '@/config/app-urls'
// We might not have specific navigation for profile, but let's reuse some existing logic or just provide a basic one.
// Since profile is for any authenticated user, we might want to check roles to decide what menu to show, or just show a minimal one.
// For now, let's try to infer if they are superadmin or business user to show relevant menu.
import { superAdminNavMain, adminNavMain } from '@/components/menus-sidebar'

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const sessionData = await getSupabaseSession()
    if (!sessionData?.user) {
        redirect(APP_URLS.AUTH.LOGIN)
    }

    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.user.id)
        .single()

    const userData = {
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Usuario',
        email: profile?.email || sessionData.user.email,
        avatar: profile?.avatar_url || ''
    }

    // Determine what navigation to show.
    // If super admin, show super admin nav.
    // If business owner/staff, we might need context of a business, which we don't have here easily.
    // It might be better to show a "Back to Dashboard" or generic menu.
    // However, AppSidebar expects navMain.

    // Let's check for super admin first
    let navItems = []
    if (profile?.is_super_admin) {
        navItems = superAdminNavMain()
    } else {
        // Try to get the last business id from cookies or similar if available, 
        // otherwise provide a default "Home" link to dashboard root
        // Since we can't easily access cookies here without importing headers/cookies, 
        // let's rely on a simpler approach or just a "Return to Dashboard" link.

        // Actually, we can import cookies
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        // Assuming there might be a cookie for last business or we just give them a link to select business
        // For now, let's just give a link to the main dashboard selection page
        navItems = [
            {
                title: 'Mis Negocios',
                url: APP_URLS.BASE,
                icon: 'LayoutDashboard' as any,
                items: []
            }
        ]
    }

    return (
        <SidebarProvider>
            <AppSidebar
                userData={userData}
                menuTeamSwitcher={[]}
                menuNavBar={{
                    navMain: navItems
                }}
            />
            <main className="flex-1 p-6 md:p-10 w-full max-w-6xl mx-auto">
                {children}
            </main>
        </SidebarProvider>
    )
}
