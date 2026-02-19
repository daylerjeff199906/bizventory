
import { Suspense } from 'react'
import { getCustomers } from '@/apis/app/customers'
import { CustomersList, PersonsCRUD } from '@/modules/customers'
import { Params, SearchParams } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
    searchParams: SearchParams
    params: Params
}

export default async function CustomersPage(props: Props) {
    const params = await props.params
    const searchParams = await props.searchParams

    const uuid = params.uuid?.toString() || ''
    const page = Number(searchParams.page) || 1
    const pageSize = Number(searchParams.limit) || 10

    const customers = await getCustomers({
        businessId: uuid,
        page,
        pageSize,
    })

    return (
        <div className="flex flex-col space-y-6">
            <div>
                <PersonsCRUD
                    businessId={uuid}
                    isCustomer
                    mode="create"
                >
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                </PersonsCRUD>
            </div>
            <Suspense fallback={<div>Cargando...</div>}>
                <CustomersList
                    customersList={customers.data}
                    totalItems={customers.total}
                    page={customers.page}
                    totalPages={customers.total_pages}
                />
            </Suspense>
        </div>
    )
}
