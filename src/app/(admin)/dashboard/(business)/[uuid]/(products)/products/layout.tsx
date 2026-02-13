import { LayoutWrapper } from '@/components/layouts'
import { Params } from '@/types'

interface Props {
    params: Params
    children: React.ReactNode
}

export default async function ProductsLayout(props: Props) {
    const params = await props.params

    return (
        <LayoutWrapper sectionTitle="Gestión de Productos">
            <div className="flex flex-col gap-6 container mx-auto">
                {props.children}
            </div>
        </LayoutWrapper>
    )
}
