'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InventoryMovementWithProduct } from '@/types'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

type SortField = 'date' | 'code' | 'product' | 'type' | 'quantity'
type SortDirection = 'asc' | 'desc'

interface IProps {
  movements: InventoryMovementWithProduct[]
}

export const InventoryMovementsTable = (props: IProps) => {
  const { movements } = props
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sortBy')?.split('.') || []
  const [sortField, setSortField] = useState<SortField | null>(
    (currentSort[0] as SortField) || null
  )
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (currentSort[1] as SortDirection) || 'asc'
  )

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

  const getMovementType = (movement: InventoryMovementWithProduct) => {
    const { reference_type, movement_type } = movement

    // Si tenemos movement_type definido, usarlo primero
    if (movement_type) {
      return movement_type.charAt(0).toUpperCase() + movement_type.slice(1)
    }

    // Si tenemos reference_type definido, usarlo
    if (reference_type) {
      return reference_type.charAt(0).toUpperCase() + reference_type.slice(1)
    }
  }

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'

    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }

    setSortField(field)
    setSortDirection(newDirection)

    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', `${field}.${newDirection}`)
    router.push(`${pathname}?${params.toString()}`)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-2 h-3 w-3" />
    )
  }

  // Ordenar los movimientos según el campo y dirección seleccionados
  const sortedMovements = [...movements].sort((a, b) => {
    if (!sortField) return 0

    const direction = sortDirection === 'asc' ? 1 : -1

    switch (sortField) {
      case 'date':
        return ((a.date || '') > (b.date || '') ? 1 : -1) * direction
      case 'code':
        return (
          ((a.product.code || '') > (b.product.code || '') ? 1 : -1) * direction
        )
      case 'product':
        const productA = `${a.product.brand?.name || ''} ${
          a.product.description || ''
        }`
        const productB = `${b.product.brand?.name || ''} ${
          b.product.description || ''
        }`
        return (productA > productB ? 1 : -1) * direction
      case 'type':
        const typeA = getMovementType(a) || ''
        const typeB = getMovementType(b) || ''
        return (typeA > typeB ? 1 : -1) * direction
      case 'quantity':
        return (a.quantity - b.quantity) * direction
      default:
        return 0
    }
  })

  if (movements.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-gray-500">
        No hay movimientos registrados
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-white shadow-none overflow-auto max-h-[70vh] w-full">
      <div className="overflow-x-auto min-w-full">
        <Table className="min-w-[800px]">
          <TableHeader className="sticky top-0 bg-gray-100 font-bold border-b">
            <TableRow>
              <TableHead className="border-r border-gray-200 w-[150px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('date')}
                  className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                >
                  Fecha y hora
                  {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead className="border-r border-gray-200 w-[100px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('code')}
                  className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                >
                  Código
                  {getSortIcon('code')}
                </Button>
              </TableHead>
              <TableHead className="border-r border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('product')}
                  className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                >
                  Producto
                  {getSortIcon('product')}
                </Button>
              </TableHead>
              <TableHead className="border-r border-gray-200 text-center w-[120px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('type')}
                  className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                >
                  Tipo
                  {getSortIcon('type')}
                </Button>
              </TableHead>
              <TableHead className="border-r border-gray-200 text-center w-[100px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('quantity')}
                  className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                >
                  Cantidad
                  {getSortIcon('quantity')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {sortedMovements.map((movement) => {
              const quantityDisplay = getQuantityDisplay(movement.quantity)
              const movementType = getMovementType(movement)

              return (
                <TableRow key={movement.id} className="hover:bg-gray-50">
                  <TableCell className="p-3 text-sm border-r border-gray-100">
                    {formatDate(movement.date || movement.movement_date)}
                    {(movement.date || movement.movement_date) && (
                      <span className="block text-xs text-gray-400">
                        {new Date(
                          movement.date || movement.movement_date || ''
                        ).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="p-3 text-sm border-r border-gray-100">
                    {movement.product.code || '-'}
                  </TableCell>
                  <TableCell className="p-3 border-r border-gray-100">
                    <div className="text-sm">
                      {movement.product.brand?.name}{' '}
                      {movement.product.description}
                      {movement.variant && <>{movement.variant.name}</>}
                      {movement?.variant &&
                        movement?.variant?.attributes?.length > 0 && (
                          <>
                            {' ('}
                            {movement.variant.attributes
                              .map((attr) => attr.attribute_value)
                              .join(', ')}
                            {')'}
                          </>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-center border-r border-gray-100">
                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full ${quantityDisplay.color}`}
                    >
                      {movementType}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
