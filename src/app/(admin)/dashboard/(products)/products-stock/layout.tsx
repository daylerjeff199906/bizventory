import { PageHeader } from '@/components/app/header-section'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:p-4 bg-white dark:bg-gray-800">
      <PageHeader
        title="Stock de Productos"
        description="Aquí puedes ver el stock actual de todos los productos disponibles en el sistema."
      />
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </div>
  )
}
