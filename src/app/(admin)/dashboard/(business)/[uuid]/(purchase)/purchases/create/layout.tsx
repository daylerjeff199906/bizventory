import { PageHeader } from '@/components/app/header-section'
import { LayoutWrapper } from '@/components/layouts'
import { APP_URLS } from '@/config/app-urls'
import { Params } from '@/types'

interface LayoutProps {
  children: React.ReactNode
  params: Params
}

export default async function Layout(props: LayoutProps) {
  const { children } = props
  const params = await props.params
  const uuid = params.uuid

  return (
    <LayoutWrapper>
      <PageHeader
        title="Registrar nueva compra"
        description="Aquí puedes registrar una nueva compra para mantener un control de tus adquisiciones."
        backButton={{
          href: APP_URLS.ORGANIZATION.PURCHASES.LIST(uuid?.toString() || ''),
          hidden: false
        }}
      />
      {children}
    </LayoutWrapper>
  )
}
