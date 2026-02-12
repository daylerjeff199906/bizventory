import { createClient } from '@/utils/supabase/server'
import { BusinessTable } from './_components/business-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateBusinessDialog } from './_components/create-business-dialog'

export default async function BusinessesPage() {
    const supabase = await createClient()

    const { data: businesses, error } = await supabase
        .from('business')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching businesses:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestión de Negocios</h1>
                    <p className="text-muted-foreground text-sm">
                        Administra todos los negocios registrados en la plataforma.
                    </p>
                </div>
                <CreateBusinessDialog />
            </div>

            <BusinessTable businesses={businesses || []} />
        </div>
    )
}
