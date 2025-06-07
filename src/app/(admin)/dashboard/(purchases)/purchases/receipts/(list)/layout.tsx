import { PageHeader } from '@/components/app/header-section'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Descarga de recibos generados"
        description="Aquí puedes descargar los recibos generados de las compras realizadas."
      />
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </div>
  )
}
