
import { LayoutWrapper } from '@/components/layouts'
import { PageHeader } from '@/components/app/header-section'
import { Params } from '@/types'

interface Props {
    params: Params
    children: React.ReactNode
}

export default async function SettingsLayout(props: Props) {
    const params = await props.params

    return (
        <LayoutWrapper sectionTitle="Configuración">
            <PageHeader
                title="Configuración del Negocio"
                description="Gestiona la información principal de tu negocio, dirección y datos de contacto."
            />
            <div className="flex flex-col gap-6 container mx-auto">
                {props.children}
            </div>
        </LayoutWrapper>
    )
}
