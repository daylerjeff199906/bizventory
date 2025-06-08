import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status?: 'pending' | 'completed' | 'cancelled' | string
  payment_method?:
    | 'efectivo'
    | 'tarjeta'
    | 'transferencia'
    | 'plin'
    | 'yape'
    | string
}

export const StatusBadge = ({ status, payment_method }: StatusBadgeProps) => {
  if (status) {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pendiente
          </Badge>
        )
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Completada
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (payment_method) {
    switch (payment_method) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pendiente
          </Badge>
        )
      case 'partial':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Parcial
          </Badge>
        )
      case 'paid':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Pagado
          </Badge>
        )
      default:
        return <Badge variant="outline">{payment_method}</Badge>
    }
  }

  return null
}
