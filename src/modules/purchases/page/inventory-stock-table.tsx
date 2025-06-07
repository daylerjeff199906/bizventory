'use client'

import { Badge } from '@/components/ui/badge'
import type { InventoryStock } from '@/types'
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
    <div className="overflow-hidden rounded-md border border-gray-200 ">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                #
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Producto
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Código
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Cantidad
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {inventoryStock.map((item, index) => {
              const status = getStockStatus(item.stock_total)
              const textColor =
                item.stock_total === 0
                  ? 'text-red-600'
                  : item.stock_total <= 10
                  ? 'text-yellow-600'
                  : item.stock_total >= 50
                  ? 'text-blue-600'
                  : 'text-green-600'

              return (
                <tr
                  key={item.product_id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {item.brand_name} {item.product_full_name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="text-xs font-mono bg-gray-50"
                    >
                      {item.code}
                    </Badge>
                  </td>
                  <td
                    className={`px-4 py-3 text-lg font-semibold text-center ${textColor}`}
                  >
                    {item.stock_total}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={`${status.color} px-2 py-1 rounded-md`}>
                      <span className="flex items-center gap-1.5">
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
    </div>
  )
}
