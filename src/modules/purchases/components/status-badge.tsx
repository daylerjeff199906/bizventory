import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status?: 'pending' | 'completed' | 'cancelled' | null
  payment_status?: 'pending' | 'paid' | 'partially_paid' | 'cancelled' | null
  className?: string
}

export default function StatusBadge({
  status,
  payment_status,
  className
}: StatusBadgeProps) {
  const getStatusConfig = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendiente',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        }
      case 'completed':
        return {
          label: 'Completado',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        }
      case 'cancelled':
        return {
          label: 'Cancelado',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        }
      default:
        return {
          label: 'Sin estado',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600'
        }
    }
  }

  const getPaymentStatusConfig = (paymentStatus: string | null | undefined) => {
    switch (paymentStatus) {
      case 'paid':
        return {
          label: 'Pagado',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        }
      case 'pending':
        return {
          label: 'Pendiente de pago',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        }
      case 'partially_paid':
        return {
          label: 'Pago parcial',
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        }
      case 'cancelled':
        return {
          label: 'Pago cancelado',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        }
      default:
        return {
          label: 'Sin estado de pago',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600'
        }
    }
  }

  // Si se proporciona status, úsalo; si no, usa payment_status
  //   const activeStatus = status || payment_status
  const config = status
    ? getStatusConfig(status)
    : getPaymentStatusConfig(payment_status)

  return (
    <Badge
      variant={config.variant}
      className={cn('rounded-full', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
