import { PageHeader } from '@/components/app/header-section'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Movimientos de Inventario"
        description="Aquí puedes ver los movimientos de inventario, incluyendo entradas y salidas de productos."
      />
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </div>
  )
}
