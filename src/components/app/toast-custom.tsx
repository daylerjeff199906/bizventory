interface ToastCustomProps {
  title: string
  message: string
}

export const ToastCustom = (props: ToastCustomProps) => {
  const { title, message } = props

  return (
    <main className="flex flex-col gap-1">
      <h1 className="text-sm font-bold">{title}</h1>
      <p className="text-xs ">{message}</p>
    </main>
  )
}
