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
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
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
      color: isPositive
        ? 'text-green-800 bg-green-100'
        : 'text-red-800 bg-red-100'
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

  if (movements.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-gray-500">
        No hay movimientos registrados
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-100 font-bold border-b">
            <tr className="text-left text-sm">
              <th className="p-3 font-medium">Fecha y hora</th>
              <th className="p-3 font-medium">Código</th>
              <th className="p-3 font-medium">Producto</th>
              <th className="p-3 font-medium text-center">Tipo</th>
              <th className="p-3 font-medium text-center">Cantidad</th>
              <th className="p-3 font-medium">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {movements.map((movement) => {
              const quantityDisplay = getQuantityDisplay(movement.quantity)
              const movementType = getMovementType(
                movement.quantity,
                movement?.description || ''
              )

              return (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="p-3 text-sm">
                    {formatDate(movement.date)}
                    {movement.date && (
                      <span className="block text-xs text-gray-400">
                        {new Date(movement.date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {movement.product.code || '-'}
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {movement.product.brand?.name}{' '}
                      {movement.product.description}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full ${quantityDisplay.color}`}
                    >
                      {movementType}
                    </Badge>
                  </td>
                  <td>
                    <p
                      className={`p-3 text-center font-bold ${
                        quantityDisplay?.isPositive
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {quantityDisplay.isPositive ? '+' : '-'}
                      {quantityDisplay.value}
                    </p>
                  </td>

                  <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                    {movement.description || '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
