import { LayoutWrapper } from '@/components/layouts'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <LayoutWrapper>{children}</LayoutWrapper>
    </>
  )
}
