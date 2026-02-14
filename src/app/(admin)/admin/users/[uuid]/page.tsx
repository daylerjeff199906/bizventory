import { createClient } from '@/utils/supabase/server'
import { EditUserForm } from '../_components/edit-user-form'
import { LayoutWrapper } from '@/components/layouts'
import { Params } from '@/types'
import { redirect } from 'next/navigation'

interface Props {
    params: Params
}

export default async function EditUserPage(props: Props) {
    const params = await props.params
    const { uuid } = params

    if (!uuid) {
        redirect('/admin/users')
    }

    const supabase = await createClient()

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uuid)
        .single()

    if (error || !profile) {
        return (
            <LayoutWrapper sectionTitle="Editar Usuario">
                <div className="p-4">
                    <p className="text-red-500">Usuario no encontrado.</p>
                </div>
            </LayoutWrapper>
        )
    }

    return (
        <EditUserForm initialData={profile} />
    )
}
