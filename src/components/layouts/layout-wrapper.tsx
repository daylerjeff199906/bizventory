import { SidebarInset } from '@/components/ui/sidebar'
import { SiteHeader } from '../panel-admin/site-header'

interface LayoutWrapperProps {
  children: React.ReactNode
  sectionTitle?: string
}

export const LayoutWrapper = ({
  children,
  sectionTitle
}: LayoutWrapperProps) => {
  return (
    <SidebarInset>
      <SiteHeader sectionTitle={sectionTitle} />
      <div className="p-4 md:p-6 flex flex-col gap-4">{children}</div>
    </SidebarInset>
  )
}
