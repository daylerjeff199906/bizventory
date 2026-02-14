interface ToastCustomProps {
  title: string
  message?: string
  description?: string
}

export const ToastCustom = (props: ToastCustomProps) => {
  const { title, message, description } = props

  return (
    <main className="flex flex-col gap-1">
      <h1 className="text-sm font-bold">{title}</h1>
      {(message || description) && <p className="text-xs ">{message || description}</p>}
    </main>
  )
}
