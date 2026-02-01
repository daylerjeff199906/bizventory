import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { Params } from '@/types'
import { Plus } from 'lucide-react'
interface Props {
  params: Params
  children: React.ReactNode
}

export default async function Layout(props: Props) {
  const params = await props.params
  const uuid = params.uuid


  return (
    <>
      {' '}
      <LayoutWrapper sectionTitle="Gestión de inventario">
        <PageHeader
          title="Inventario"
          description="Aquí puedes ver todos los productos en tu tienda."
        />
        <div className="flex flex-col gap-4 container mx-auto">{props.children}</div>
      </LayoutWrapper>
    </>
  )
}
