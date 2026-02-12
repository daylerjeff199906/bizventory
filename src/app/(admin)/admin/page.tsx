import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Building2, UserPlus, Activity } from 'lucide-react'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    const { count: businessesCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })

    const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    const { count: activeBusinessesCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Negocios</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{businessesCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Registrados en la plataforma</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Negocios Activos</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{activeBusinessesCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Operando actualmente</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{usersCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Cuentas creadas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nuevos (Mes)</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">Usuarios registrados este mes</p>
                </CardContent>
            </Card>

            <div className="col-span-4 mt-4">
                <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Quick Actions Placeholder */}
                </div>
            </div>
        </div>
    )
}
