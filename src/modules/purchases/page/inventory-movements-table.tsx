'use client'

import { Badge } from '@/components/ui/badge'
import { InventoryMovementWithProduct } from '@/types'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface IProps {
  movements: InventoryMovementWithProduct[]
}

export const InventoryMovementsTable = (props: IProps) => {
  const { movements } = props

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No especificada'
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getQuantityDisplay = (quantity: number) => {
    const isPositive = quantity > 0
    return {
      value: Math.abs(quantity),
      isPositive,
      icon: isPositive ? (
        <ArrowDownLeft className="h-3 w-3" />
      ) : (
        <ArrowUpRight className="h-3 w-3" />
      ),
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50'
    }
  }

  const getMovementType = (quantity: number, description: string | null) => {
    if (quantity > 0) {
      if (description?.toLowerCase().includes('compra')) return 'Compra'
      if (description?.toLowerCase().includes('devolución')) return 'Devolución'
      if (description?.toLowerCase().includes('ajuste')) return 'Ajuste +'
      return 'Entrada'
    } else {
      if (description?.toLowerCase().includes('venta')) return 'Venta'
      if (description?.toLowerCase().includes('transferencia'))
        return 'Transferencia'
      if (description?.toLowerCase().includes('uso interno'))
        return 'Uso Interno'
      if (description?.toLowerCase().includes('ajuste')) return 'Ajuste -'
      return 'Salida'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {movements.map((movement) => {
            const formattedDate = formatDate(movement.date)
            const quantityDisplay = getQuantityDisplay(movement.quantity)
            const movementType = getMovementType(
              movement.quantity,
              movement?.description || ''
            )

            let date, time
            if (typeof formattedDate === 'string') {
              date = formattedDate
              time = ''
            } else {
              date = formattedDate.date
              time = formattedDate.time
            }

            return (
              <tr
                key={movement.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{date}</div>
                    <div className="text-gray-500">{time}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-900 text-sm">
                      {movement.product.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {movement.product.code}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <Badge
                    variant="secondary"
                    className={`${quantityDisplay.bgColor} ${quantityDisplay.color} border-0`}
                  >
                    <span className="flex items-center gap-1">
                      {quantityDisplay.icon}
                      {movementType}
                    </span>
                  </Badge>
                </td>
                <td className="py-4 px-6 text-center">
                  <span
                    className={`font-semibold text-lg ${quantityDisplay.color}`}
                  >
                    {quantityDisplay.isPositive ? '+' : '-'}
                    {quantityDisplay.value}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-900 max-w-xs">
                    {movement.description || 'Sin descripción'}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
