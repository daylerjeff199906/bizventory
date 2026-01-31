import { LayoutWrapper } from '@/components/layouts'
import CreateSaleForm from '@/modules/sales/components/create-sale-form'

export default function CreateSalePage() {
    console.log('--- Rendering Create Page')
    return <LayoutWrapper sectionTitle="Crear venta">
        <CreateSaleForm />
    </LayoutWrapper>
}
