import { LayoutWrapper } from '@/components/layouts'
import CreateSaleForm from '@/modules/sales/components/create-sale-form'

export default function CreateSalePage() {
    return <LayoutWrapper sectionTitle="Crear venta">
        <CreateSaleForm />
    </LayoutWrapper>
}
