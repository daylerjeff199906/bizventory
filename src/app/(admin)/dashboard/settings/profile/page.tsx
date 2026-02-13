import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MyProfileForm } from './_components/my-profile-form'
import { LayoutWrapper } from '@/components/layouts'

export default async function ProfileSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        // Should generally not happen if user exists
        return <div>No se encontró el perfil.</div>
    }

    return (
        <LayoutWrapper sectionTitle="Configuración de Perfil">
            <div className="container max-w-4xl mx-auto py-6">
                <MyProfileForm
                    initialData={{
                        firstName: profile.first_name || '',
                        lastName: profile.last_name || '',
                        email: profile.email || user.email || '',
                        avatarUrl: profile.avatar_url,
                    }}
                />
            </div>
        </LayoutWrapper>
    )
}
