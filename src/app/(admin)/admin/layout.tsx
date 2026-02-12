import { getSupabaseSession } from '@/lib/session'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const sessionData = await getSupabaseSession()
    if (!sessionData?.user) {
        redirect('/login')
    }

    const supabase = await createClient()
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', sessionData.user.id)
        .single()

    // If error (e.g., profile doesn't exist yet) or not super admin, deny access
    if (error || !profile?.is_super_admin) {
        redirect('/dashboard')
    }

    return (
        <div className="flex h-screen flex-col">
            <header className="flex h-16 items-center justify-between border-b px-6 bg-background sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <Link href="/admin" className="text-xl font-bold tracking-tight">
                        Bizventory Admin
                    </Link>
                    <nav className="flex gap-2">
                        <Button variant="ghost" asChild>
                            <Link href="/admin/businesses">Negocios</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/admin/users">Usuarios</Link>
                        </Button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden md:inline-block">
                        {sessionData.user.email}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard">Ir al Dashboard</Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 overflow-auto bg-muted/10 p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
