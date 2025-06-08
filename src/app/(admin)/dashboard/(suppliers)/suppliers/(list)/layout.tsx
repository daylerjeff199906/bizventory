export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:p-4 bg-white dark:bg-gray-800">
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
    </div>
  )
}
