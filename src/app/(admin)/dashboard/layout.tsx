import SidebarLayout from '@/components/sidebar-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
    </SidebarLayout>
  )
}
