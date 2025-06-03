'use client'

import { Badge } from '@/components/ui/badge'
import { InventoryStock } from '@/types'
import { AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react'

interface Props {
  inventoryStock: InventoryStock[]
}

export default function InventoryStockTable({ inventoryStock }: Props) {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return {
        label: 'Sin Stock',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="h-3 w-3" />
      }
    if (quantity <= 5)
      return {
        label: 'Stock Bajo',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <TrendingDown className="h-3 w-3" />
      }
    if (quantity >= 50)
      return {
        label: 'Stock Alto',
        color: 'bg-blue-100 text-blue-800',
        icon: <TrendingUp className="h-3 w-3" />
      }
    return {
      label: 'Stock Normal',
      color: 'bg-green-100 text-green-800',
      icon: <Package className="h-3 w-3" />
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="p-3 text-xs text-gray-500 uppercase">#</th>
            <th className="p-3 text-xs text-gray-500 uppercase">Producto</th>
            <th className="p-3 text-xs text-gray-500 uppercase">Código</th>
            <th className="p-3 text-xs text-gray-500 uppercase text-center">
              Cantidad
            </th>
            <th className="p-3 text-xs text-gray-500 uppercase text-center">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {inventoryStock.map((item, index) => {
            const status = getStockStatus(item.current_stock)
            const textColor =
              item.current_stock === 0
                ? 'text-red-600'
                : item.current_stock <= 10
                ? 'text-yellow-600'
                : item.current_stock >= 50
                ? 'text-blue-600'
                : 'text-green-600'

            return (
              <tr key={item.product_id} className="hover:bg-gray-50">
                <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                <td className="p-3 text-sm font-medium">
                  {item.brand_name} {item.product_description}
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="text-xs font-mono">
                    {item.product_code}
                  </Badge>
                </td>
                <td
                  className={`p-3 text-lg font-semibold text-center ${textColor}`}
                >
                  {item.current_stock}
                </td>
                <td className="p-3 text-center">
                  <Badge className={status.color}>
                    <span className="flex items-center gap-1">
                      {status.icon}
                      {status.label}
                    </span>
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
