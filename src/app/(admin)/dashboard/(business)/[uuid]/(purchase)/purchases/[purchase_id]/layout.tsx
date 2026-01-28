import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { Params } from '@/types'

interface LayoutProps {
  params: Params
  children: React.ReactNode
}

export default async function Layout(props: LayoutProps) {
  const { children } = props
  const params = await props.params
  const uuid = params.uuid
  const title = 'Detalles de Compra'

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-4 container max-w-5xl mx-auto md:gap-6">
        <PageHeader
          title={title}
          description="Aquí puedes ver los detalles de la compra, incluyendo los productos adquiridos y sus cantidades."
          backButton={{
            href: APP_URLS.ORGANIZATION.PURCHASES.LIST(uuid?.toString() || ''),
            hidden: false
          }}
        />

        {children}
      </div>
    </LayoutWrapper>
  )
}
