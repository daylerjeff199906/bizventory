export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800">
      <div className="flex flex-col gap-4 container mx-auto">{children}</div>
      <div className="mt-4">
        {/* Footer or additional content can go here */}
      </div>
    </div>
  )
}
