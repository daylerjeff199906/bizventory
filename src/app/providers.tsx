// app/providers.tsx
'use client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastContainer theme="dark" />
      {children}
    </>
  )
}
