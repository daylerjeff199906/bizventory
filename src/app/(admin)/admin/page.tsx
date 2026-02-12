import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, ShieldAlert } from 'lucide-react'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch basic stats
    const { count: businessCount } = await supabase
        .from('business')
        .select('*', { count: 'exact', head: true })

    const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Panel de Super Admin</h1>
                <p className="text-muted-foreground text-sm">
                    Bienvenido al centro de control global de Bizventory.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Negocios</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{businessCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Negocios registrados en la plataforma
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Usuarios con perfiles creados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas de Sistema</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            No hay problemas detectados
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
