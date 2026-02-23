
import { Suspense } from 'react'
import { getBusinessById } from '@/apis/app/business'
import { SettingsForm } from '@/modules/business'
import { Params } from '@/types'
import { redirect } from 'next/navigation'

interface Props {
    params: Params
}

export default async function SettingsPage(props: Props) {
    const params = await props.params
    const businessId = params.uuid?.toString()

    if (!businessId) {
        redirect('/')
    }

    const businessData = await getBusinessById(businessId)

    if (!businessData) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Error al cargar la información del negocio.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Suspense fallback={<div>Cargando configuración...</div>}>
                <SettingsForm initialData={businessData} businessId={businessId} />
            </Suspense>
        </div>
    )
}
