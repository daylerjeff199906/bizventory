import { createClient } from '@/utils/supabase/server'
import { UserTable } from './_components/user-table'

export default async function UsersPage() {
    const supabase = await createClient()

    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
                <p className="text-muted-foreground text-sm">
                    Administra los usuarios de la plataforma y sus accesos.
                </p>
            </div>

            <UserTable users={users || []} />
        </div>
    )
}
