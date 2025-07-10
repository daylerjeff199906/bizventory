'use client'
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Link from 'next/link'
import { APP_URLS } from '@/config/app-urls'
import { Brand, InventoryMovementWithProduct } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface InventoryDashboardProps {
  movements?: InventoryMovementWithProduct[]
  inventoryStats?: {
    totalProducts: number
    totalValue: number
    lowStock: number
    outOfStock: number
  }
  brandsList?: Brand[]
}

export default function InventoryDashboard({
  movements = [],
  inventoryStats = {
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  }
}: InventoryDashboardProps) {
  return (
    <main className="flex-1 space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryStats.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de productos en inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/{inventoryStats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Incluye ventas y compras recientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inventoryStats.lowStock}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryStats.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">
              Necesitan reposición
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Movements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Movimientos Recientes</CardTitle>
                <CardDescription>
                  Últimas entradas y salidas de inventario
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length > 0 ? (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium text-sm">
                        {movement.product?.brand?.name}{' '}
                        {movement.product?.description}{' '}
                        {movement.variant?.name || ''}{' '}
                        {movement.variant?.attributes
                          ?.map((attr) => attr.attribute_value)
                          .join(', ')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            movement.movement_type === 'entry'
                              ? 'default'
                              : 'secondary'
                          }
                          className={cn(
                            'rounded-full',
                            movement.movement_type === 'entry'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {movement.movement_type === 'entry' ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {movement.movement_type === 'entry'
                            ? 'Entrada'
                            : 'Salida'}
                        </Badge>
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>
                        {movement.date &&
                          format(new Date(movement.date), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay movimientos recientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Brands List */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Marcas
            </CardTitle>
            <CardDescription>Listado de marcas registradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brandsList.length > 0 ? (
              <div className="space-y-3">
                {brandsList.slice(0, 5).map((brand) => (
                  <div key={brand.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={`Logo ${brand.name}`}
                          className="h-8 w-8 object-contain rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {brand.name}
                      </p>
                      <Badge
                        variant={
                          brand.status === StatusItems.ACTIVE
                            ? 'default'
                            : 'secondary'
                        }
                        className={cn(
                          'text-xs',
                          brand.status === StatusItems.ACTIVE
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {brand.status === StatusItems.ACTIVE
                          ? 'Activo'
                          : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4" size="sm" asChild>
                  <Link href={APP_URLS.BRANDS.LIST}>Ver Todas las Marcas</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                No hay marcas registradas
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Operaciones frecuentes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href={APP_URLS.PURCHASES.CREATE}>
                <TrendingUp className="h-6 w-6" />
                <span>Registrar Entrada</span>
              </Link>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href={APP_URLS.SALES.CREATE}>
                <TrendingDown className="h-6 w-6" />
                <span>Registrar Salida</span>
              </Link>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href={APP_URLS.PRODUCTS.CREATE}>
                <Package className="h-6 w-6" />
                <span>Nuevo Producto</span>
              </Link>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href={APP_URLS.REPORTS.INVENTORY}>
                <FileText className="h-6 w-6" />
                <span>Generar Reporte</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
