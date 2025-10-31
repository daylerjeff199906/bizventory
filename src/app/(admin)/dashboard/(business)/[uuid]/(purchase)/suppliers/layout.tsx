import { LayoutWrapper } from '@/components/layouts'

interface LayoutProps {
  children: React.ReactNode
}
export default function Layout(props: LayoutProps) {
  return <LayoutWrapper>{props.children}</LayoutWrapper>
}
